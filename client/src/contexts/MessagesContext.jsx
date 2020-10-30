import React, { useState } from 'react';

export const MessagesContext = React.createContext()

const MessagesProvider = (props) => {
    const [messages, setMessages] = useState([])

    return (
        <MessagesContext.Provider
            value={[messages, setMessages]}
        >
            {props.children}
        </MessagesContext.Provider >
    );
}

export default MessagesProvider;
