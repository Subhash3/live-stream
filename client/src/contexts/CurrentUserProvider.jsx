import React, { useState, useEffect } from 'react';

export const CurrentUserContext = React.createContext()

const CurrentUserProvider = (props) => {
    let localData = sessionStorage.getItem('currentUser')
    let parsedData = undefined
    try {
        parsedData = JSON.parse(localData)
    } catch (err) {
        parsedData = undefined
    }

    const [currentUser, setCurrentUser] = useState(parsedData)

    useEffect(() => {
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser))
    }, [currentUser])
    return (
        <CurrentUserContext.Provider
            value={[currentUser, setCurrentUser]}
        >
            {props.children}
        </CurrentUserContext.Provider >
    );
}

export default CurrentUserProvider;
