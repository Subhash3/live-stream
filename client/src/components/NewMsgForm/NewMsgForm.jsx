import React, { useState } from 'react';
import './NewMsgForm.min.css'

const NewMsgForm = ({ sendMessage }) => {
    const [newMsg, setNewMsg] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!newMsg) {
            return
        }
        sendMessage(newMsg)
        setNewMsg("")
    }

    return (
        <form className="new-msg-form" onSubmit={handleSubmit}>
            <input
                placeholder="New message: "
                type="text"
                className="new-msg"
                value={newMsg}
                onChange={(e) => { setNewMsg(e.target.value) }}
            />
            <input
                type="submit"
                className="send-msg-button"
                value="Send"
            />
        </form>
    );
}

export default NewMsgForm;
