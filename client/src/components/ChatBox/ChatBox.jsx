import React, { useContext } from 'react';
import Message from '../Message/Message.jsx'
import { MessagesContext } from '../../contexts/MessagesContext'
import './ChatBox.min.css'

const ChatBox = () => {
    const [messages, setMessages] = useContext(MessagesContext)

    return (
        <div className="chat-box">
            {console.log("Rendering chat box")}
            {messages.map(msgObj => {
                let messageID = msgObj.id
                console.log("Inside MAP: ", msgObj)
                return <Message key={messageID} msgObj={msgObj} />
            })}
        </div>
    )
}


export default ChatBox;
