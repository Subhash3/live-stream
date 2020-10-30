import React, { useEffect, useContext, useState, useRef } from 'react';
import { Redirect, useParams } from 'react-router-dom'
import socketIoClient from 'socket.io-client'
import { CurrentUserContext } from '../../contexts/CurrentUserProvider.jsx'
import { MessagesContext } from '../../contexts/MessagesContext'
import ChatBox from '../ChatBox/ChatBox.jsx'
import NewMsgForm from '../../components/NewMsgForm/NewMsgForm.jsx'
import VideoStream from '../../components/VideoStream/VideoStream.jsx'
import Peer from 'peerjs'
import './ChatRoom.min.css'
import { v4 as uuid } from 'uuid'
import axios from 'axios'

import { Container, MenuItem, Select, InputLabel } from '@material-ui/core';

const SOCKET_IO_SERVER = 'http://localhost:3000'
const PEER_SERVER = "localhost"
const BROADCAST_RECEIVER = "all"
const BROADCAST_MSG = "Brodcast"
const PRIVATE_MSG = "Private"
const PRIVATE_RECEIVER = "Me"

const ChatRoom = (props) => {
    const [currentUser] = useContext(CurrentUserContext)
    const urlParams = useParams()
    const roomID = urlParams.roomID

    const myPeerIDRef = useRef()
    const createdByRef = useRef()
    const socketRef = useRef()
    const peerObjectRef = useRef()

    const [videoStream, setVideoStream] = useState(undefined)
    const [streamerID, setStreamerID] = useState(undefined)
    const [messages, setMessages] = useContext(MessagesContext)
    const [usersInThisRoom, setUsersInThisRoom] = useState([])
    const [receiver, setReceiver] = useState(BROADCAST_RECEIVER)

    console.log("RENDERING CHAT ROOM")
    // console.log({ messages })
    // console.log({ currentUser })
    // console.log(props)

    console.log({ receiver })

    useEffect(() => {
        // console.log("INSIDE USEEFFECT")
        socketRef.current = socketIoClient(SOCKET_IO_SERVER, [
            "websockets", "polling"
        ])

        peerObjectRef.current = new Peer(undefined, {
            host: PEER_SERVER,
            port: "3001"
        })


        // Answers to other peers' calls
        peerObjectRef.current.on('call', call => {
            console.log("[Callee]: Recieved call from a peer:", call.metadata.callerID)
            call.answer(videoStream)
            setStreamerID(call.metadata.callerID)

            call.on('stream', otherPeerStream => {
                console.log("[Callee]: Recieved Stream", otherPeerStream)
                addVideoStream(call.metadata.callerID, otherPeerStream)
            })

            call.on('close', () => {
                console.log("Call has been closed!")
            })
        })

        if (currentUser) {
            peerObjectRef.current.on('open', peerID => {
                console.log("Peer connection established. ID: ", peerID)
                socketRef.current.emit('join-room', peerID, roomID, currentUser.instructor)
                getUsersInThisRoom()
                getAllBroadcasts()

                socketRef.current.on('invalid-room', () => {
                    console.log("Invalid Room")
                    props.history.push('/')
                })
                myPeerIDRef.current = peerID

                if (currentUser.instructor) {
                    setStreamerID(peerID)
                    navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    }).then(stream => {
                        setVideoStream(stream)
                    }).catch(error => {
                        console.error("Error Occured:", error)
                    })
                }
            })
        }
        // console.log(videoStreams)
    }, [])

    if (socketRef.current && videoStream && streamerID) {
        // setup even listener for new connections
        socketRef.current.on('new-user-joined', otherPeerID => {
            console.log("[new-user-joined]", otherPeerID)
            if (currentUser.instructor) {
                connectToNewPeer(otherPeerID)
            }

            let msg = createMsgObject("server", `New user ${otherPeerID} has joined!`, BROADCAST_MSG)
            setMessages([...messages, msg])

            setUsersInThisRoom([...usersInThisRoom, otherPeerID])
        })

        // socketRef.current.on('all-broadcasts', allBroadcasts => {
        //     // allBroadcasts = JSON.parse(allBroadcasts)
        //     console.log("[all-broadcasts]", { allBroadcasts })

        //     setMessages([...allBroadcasts, ...messages])
        // })

        socketRef.current.on('received-new-message', (senderID, newMsgBody, msgType) => {
            let msg = createMsgObject(senderID, newMsgBody, msgType)

            setMessages([...messages, msg])
        })

        socketRef.current.on("user-disconnected", (peerID) => {
            let msg = createMsgObject("server", `User ${peerID} has left the room!`, BROADCAST_MSG)
            setMessages([...messages, msg])
            removeUser(peerID)
        })

        socketRef.current.on('room-closed', () => {
            let msg = createMsgObject("server", `Room has been closed!`)
            setMessages([...messages, msg])
            props.history.push('/')
        })
    }

    const getAllBroadcasts = async () => {
        let response = await axios.get(`${SOCKET_IO_SERVER}/broadcasts/${roomID}`)
        let allBroadcasts = response.data
        // console.log("All broadcasts: ", allBroadcasts)

        setMessages([...allBroadcasts, ...messages])
    }

    const removeUser = (peerID) => {
        setUsersInThisRoom(usersInThisRoom.filter(userID => userID !== peerID))
        if (receiver === peerID) {
            setReceiver(BROADCAST_RECEIVER)
        }
    }

    const getUsersInThisRoom = async () => {
        let response = await axios.get(SOCKET_IO_SERVER + '/users/' + roomID)
        console.log({ response })
        let userObjects = response.data.users
        if (!userObjects) {
            return
        }
        console.log({ userObjects })
        let peerIDsOfUsersInThisRoom = []
        Object.values(userObjects).forEach(user => {
            if (user.peerID !== myPeerIDRef.current) {
                peerIDsOfUsersInThisRoom.push(user.peerID)
            }
        })
        setUsersInThisRoom([...peerIDsOfUsersInThisRoom, BROADCAST_RECEIVER])
    }

    const createMsgObject = (sender, body, msgType, msgReceiver) => {
        if (!msgReceiver) {
            msgReceiver = msgType === BROADCAST_MSG ? BROADCAST_RECEIVER : PRIVATE_RECEIVER
        }
        let msg = {
            id: `${sender} - (${new Date().toLocaleDateString()}) [${uuid()}]`,
            sender: sender,
            receiver: msgReceiver,
            msgBody: body,
            msgType
        }

        return msg
    }

    const connectToNewPeer = (otherPeerID) => {
        console.log("[Caller]: Calling peer: ", otherPeerID)
        const call = peerObjectRef.current.call(otherPeerID, videoStream, {
            metadata: { callerID: streamerID }
        })
        // console.log(call, otherPeerID, myStream)

        call.on('stream', peersVideoStream => {
            console.log("[Caller]: User answered the call and sent")
            console.log("[Caller]: Recieved stream from peer: ", peersVideoStream)
            addVideoStream(otherPeerID, peersVideoStream)
        })

        call.on('close', () => {
            console.log(`Peer ${otherPeerID} 's call has been disconnected`)
        })
    }

    const addVideoStream = (peerID, stream) => {
        console.log("Adding new video stream of peer: ", peerID)
        setVideoStream(stream)
    }

    const sendMessage = (newMsg) => {
        let msgType
        if (receiver === BROADCAST_RECEIVER) {
            msgType = BROADCAST_MSG
        } else {
            msgType = PRIVATE_MSG
        }
        let msg = createMsgObject("Me", newMsg, msgType, receiver)

        setMessages([...messages, msg])

        console.log("Emitting [new-message]", roomID, newMsg, myPeerIDRef.current, receiver)
        socketRef.current.emit('new-message', roomID, newMsg, myPeerIDRef.current, receiver)
    }

    if (!currentUser) {
        return <Redirect to="/login" />
    }
    return (
        <Container>
            <h1 className="room-created-by" ref={createdByRef}> </h1>
            {/* <h1 className="receiver">Receiver: {receiver}</h1> */}
            <h3 className="current-user">{currentUser.username}</h3>

            <div className="stream-and-chat">
                {videoStream ? <VideoStream id={streamerID} stream={videoStream} /> : <h3>No Video Yet</h3>}

                <div className="chat-area">
                    <ChatBox messages={messages} />

                    <div className="form-and-users">
                        <div className="users-in-this-room">
                            {/* <h6 id="receiver">To: </h6> */}
                            <InputLabel id="receiver">To: </InputLabel>
                            <Select
                                autoWidth={true}
                                labelId="receiver"
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                            >
                                {usersInThisRoom.map(userID => {
                                    return <MenuItem key={userID} className="user" value={userID}>{userID}</MenuItem>
                                })}
                            </Select>
                        </div>
                        <NewMsgForm sendMessage={sendMessage} />
                    </div>
                </div>
            </div>
        </Container >
    );
}

export default ChatRoom;