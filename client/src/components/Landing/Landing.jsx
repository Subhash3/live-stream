import React, { useState, useContext } from 'react';
import { Redirect, Link } from 'react-router-dom'
import EventIcon from '@material-ui/icons/Event';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import LoginForm from '../LoginForm/LoginForm.jsx'
import { CurrentUserContext } from '../../contexts/CurrentUserProvider.jsx'
import { v4 as uuid } from 'uuid'
import axios from 'axios'
import './Landing.min.css'

const SOCKET_IO_SERVER = 'http://localhost:3000'

const Landing = () => {
    const [currentUser] = useContext(CurrentUserContext)
    const [roomID, setRoomID] = useState(-1)

    const startMeet = async (e) => {
        let roomID = uuid()
        let requestBody = {
            roomID,
            createdBy: currentUser.username
        }
        let response = await axios.post(`${SOCKET_IO_SERVER}/rooms`, requestBody)
        if (response.data.alreadyExists) {
            console.log("Error creating the room!")
        } else {
            console.log("Room with ID " + roomID + " has been created by " + currentUser.username)
            setRoomID(roomID)
        }
    }

    if (!currentUser) {
        return <LoginForm />
    }
    else {
        if (roomID !== -1) {
            return (
                <Redirect to={`/room/${roomID}`} />
            )
        }
    }

    if (currentUser.instructor) {
        return <InstructorsLanding startMeet={startMeet} />
    } else {
        return <StudentsLanding />
    }
}

const InstructorsLanding = ({ startMeet }) => {
    return (
        <div className="landing">
            <div className="title">Shine's meet</div>
            <div className="buttons">
                <div onClick={startMeet} className="instant-meet btn">
                    <EventIcon />
                    <button type="button" >Instant Meet</button>
                </div>
                <div className="schedule-meet btn">
                    <VideoCallIcon />
                    <button type="button">Schedule a Meet</button>
                </div>
            </div>
        </div>
    );
}

const StudentsLanding = () => {
    const [meetID, setMeetID] = useState("")
    return (
        <div className="landing">
            <div className="title">Shine's meet</div>
            <div className="buttons">
                <input
                    type="text"
                    value={meetID}
                    onChange={(e) => setMeetID(e.target.value)}
                    placeholder="Enter Meet ID: "
                />
                <Link style={LinkStyles} to={`/room/${meetID}`}>
                    <div className="join-meet btn">
                        <VideoCallIcon />
                        <button type="button">Join a Meet</button>
                    </div>
                </Link>
            </div>
        </div>
    );
}

const LinkStyles = {
    textDecoration: 'none',
    cursor: 'pointer',
}

export default Landing;
