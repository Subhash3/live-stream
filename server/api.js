const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const http = require("http")
const socketIO = require("socket.io")
// const { ExpressPeerServer } = require("peer")
const { v4: uuid } = require("uuid")

app = express()
server = http.Server(app)
io = socketIO(server, { origins: '*:*' }) // I don't understand this part :(

// global variables
PORT = 3000
onlineUsers = {}
var allRooms = {}
var socketIDInfo = {}
var userToSocketMap = {}
var socketIDToPeerIDMap = {}
var usersAndStreams = {}
var roomToBroadcastMessagesMap = {}
const BROADCAST_RECEIVER = "all"
const BROADCAST_MSG = "Brodcast"
const PRIVATE_MSG = "Private"

/*
    roomID: {
        peerId: stream,
        peerId: stream
    },
    roomID:  {
        peerId: stream,
        peerId: stream
    },
*/
const welcomeMessage = "Welcome to Shine's Meet"

// // Setting up peer server
// const peerServer = ExpressPeerServer(server, {})

// Middleware to parse search params
app.use(bodyParser.json())

// Middleware to resolve cors!
app.use(cors())

// // peer server route
// app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.send({ "msg": welcomeMessage })
})

app.get('/stream-store/:roomID', (req, res) => {
    let roomID = req.params.roomID
    let streams = usersAndStreams[roomID]
    res.send(usersAndStreams)
})

app.post('/stream-store/', (req, res) => {
    let { roomID, peerId, stream } = req.body

    if (!(roomID in usersAndStreams)) {
        usersAndStreams[roomID] = {}
    }
    usersAndStreams[roomID][peerId] = stream
    res.send("Stored!")
})

app.get('/users/:roomID', (req, res) => {
    let roomID = req.params.roomID
    let users = getUsersOfARoom(roomID)
    res.send(users)
})

app.get('/room/:roomID', (req, res) => {
    let roomID = req.params.roomID
    let room = allRooms[roomID]

    res.send({ roomID, room })
})

app.post('/rooms/', (req, res) => {
    let roomID = req.body.roomID
    let createdBy = req.body.createdBy
    let response = {}

    if (Object.keys(allRooms).includes(roomID)) {
        response.message = "Room already exists!"
        response.alreadyExists = true
    } else {
        response.message = "Room has beem created successfully!"
        response.alreadyExists = false

        allRooms[roomID] = { users: {}, createdBy }
    }

    res.send(response)
})

app.get('/broadcasts/:roomID', (req, res) => {
    let roomID = req.params.roomID
    res.send(roomToBroadcastMessagesMap[roomID])
})

const checkIfTheRoomExists = (roomID) => {
    return Object.keys(allRooms).includes(roomID)
}

const getUsersOfARoom = (roomID) => {
    let room = allRooms[roomID]
    return room
}

const getUserInfo = (userSockerID) => {
    for (roomID in allRooms) {
        let room = allRooms[roomID]
        let usersInThisRoom = room.users
        if (Object.keys(usersInThisRoom).includes(userSockerID)) {
            console.log(`User ${userSockerID} is in room ${roomID} which was created by ${room.createdBy}`)
            return {
                user: usersInThisRoom[userSockerID],
                room: roomID,
                createdBy: room.createdBy
            }
        }
    }
}

const removeUser = (socketID, roomID, isInstructor) => {
    delete userToSocketMap[socketID]
    delete socketIDInfo[socketID]
    delete allRooms[roomID].users[socketID]
    delete socketIDToPeerIDMap[socketID]

    if (isInstructor) {
        delete allRooms[roomID]
    }
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

// listen on the connection event for incoming sockets
io.on('connection', function (socket) {
    console.log('A new client connected', socket.id);
    userToSocketMap[socket.id] = socket;

    socket.on('join-room', (peerID, roomID, isInstructor) => {
        console.log("(Server): [join-room]\n\tuser: ", peerID, "\n\troom: ", roomID)
        let doesRoomExist = checkIfTheRoomExists(roomID)
        if (!doesRoomExist) {
            console.log("Invalid room")
            socket.emit('invalid-room')
            return
        }
        socket.join(roomID)
        socketIDToPeerIDMap[socket.id] = peerID
        console.log(`New user: ${peerID} joined the room: ${roomID}`);
        // console.log({ allRooms })

        socketIDInfo[socket.id] = { roomID, isInstructor }
        let userObject = { peerID, socketID: socket.id }
        allRooms[roomID].users[socket.id] = userObject

        // Inform all the other users in this room that a new user has just joined
        console.log("(Server): broadcasting \n\tto", roomID, "\n\tpeerID:", peerID)
        socket.to(roomID).broadcast.emit('new-user-joined', peerID)
        console.log(allRooms)
        console.log(socketIDInfo)
        // console.log(userToSocketMap)

        // console.log(`(Server): emittimg [all-broadcasts]\n\t ${JSON.stringify(allBroadcastMessages)} to this newly joined user`)
        // socket.emit('all-broadcasts', JSON.stringify(allBroadcastMessages))
    })

    socket.on("new-message", (roomID, newMsg, senderID, recieverID) => {
        console.log("(Server): [new-message]\n\tsender: ", senderID, "\n\troom: ", roomID, "\n\tReceiver: ", recieverID)
        console.log("(Server): broadcasting \n\tto", roomID, "\n\t{senderID:", senderID, "Message:", newMsg, "}")

        // console.log("Receiver: ", recieverID)
        if (recieverID === BROADCAST_RECEIVER) {
            let newMsgObject = createMsgObject(senderID, newMsg, BROADCAST_MSG, BROADCAST_RECEIVER)
            if (roomID in roomToBroadcastMessagesMap) {
                roomToBroadcastMessagesMap[roomID].push(newMsgObject)
            } else {
                roomToBroadcastMessagesMap[roomID] = [newMsgObject]
            }

            socket.to(roomID).broadcast.emit('received-new-message', senderID, newMsg, BROADCAST_MSG)
            if (!(roomID in roomToBroadcastMessagesMap)) {
                roomToBroadcastMessagesMap[roomID] = []
            }
        } else {
            let recieverSocketID
            for (socketID in socketIDToPeerIDMap) {
                let peerID = socketIDToPeerIDMap[socketID]
                if (peerID === recieverID) {
                    recieverSocketID = socketID
                    break
                }
            }

            let recieverSocket = userToSocketMap[recieverSocketID]
            recieverSocket.emit('received-new-message', senderID, newMsg, PRIVATE_MSG)
        }
    })

    socket.on('disconnect', (reason) => {
        console.log(`${socket.id} has been disconnected. : ${reason}`)

        let hisRoomID, hisPeerID
        try {
            hisRoomID = socketIDInfo[socket.id].roomID
            hisPeerID = allRooms[hisRoomID].users[socket.id].peerID
        } catch (err) {
            hisRoomID = undefined
            delete userToSocketMap[socket.id]
            return
        }
        let isInstructor = socketIDInfo[socket.id].isInstructor

        if (isInstructor) {
            socket.to(hisRoomID).broadcast.emit('room-closed')
        } else {
            socket.to(hisRoomID).broadcast.emit('user-disconnected', hisPeerID)
        }
        removeUser(socket.id, hisRoomID, isInstructor)

        console.log(allRooms)
        console.log(socketIDInfo)
        // console.log(userToSocketMap)
    })
});

server.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://<%s>:%s", host, port)
})


// // Peerjs Connections
// peerServer.on('connection', (client) => {
//     console.log("(PeerJS): Got a connection from", client.id)
//     // peerServer.emit('open', client.id)
// })

/** SOCKET IO CHEATSHEET **/
//  // send to current request socket client
//  socket.emit('message', "this is a test");// Hasn't changed

//  // sending to all clients, include sender
//  io.sockets.emit('message', "this is a test"); // Old way, still compatible
//  io.emit('message', 'this is a test');// New way, works only in 1.x

//  // sending to all clients except sender
//  socket.broadcast.emit('message', "this is a test");// Hasn't changed

//  // sending to all clients in 'game' room(channel) except sender
//  socket.broadcast.to('game').emit('message', 'nice game');// Hasn't changed

//  // sending to all clients in 'game' room(channel), include sender
//  io.sockets.in('game').emit('message', 'cool game');// Old way, DOES NOT WORK ANYMORE
//  io.in('game').emit('message', 'cool game');// New way
//  io.to('game').emit('message', 'cool game');// New way, "in" or "to" are the exact same: "And then simply use to or in (they are the same) when broadcasting or emitting:" from http://socket.io/docs/rooms-and-namespaces/

//  // sending to individual socketid, socketid is like a room
//  io.sockets.socket(socketid).emit('message', 'for your eyes only');// Old way, DOES NOT WORK ANYMORE
//  socket.broadcast.to(socketid).emit('message', 'for your eyes only');// New way