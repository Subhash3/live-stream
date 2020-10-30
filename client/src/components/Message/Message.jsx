import React from 'react';
import './Message.min.css'

const Message = ({ msgObj }) => {
    console.log("Rendering Message", { msgObj })

    if (!msgObj) {
        return null
    }
    return (
        <div className="message">
            <div className="info">
                <div className="sender">{msgObj.sender}</div>
                <div className="receiver">{msgObj.receiver}</div>
                <div className="msg-type">({msgObj.msgType})</div>
            </div>
            <div className="msg-body">{msgObj.msgBody}</div>
        </div>
    )
}


export default Message;
