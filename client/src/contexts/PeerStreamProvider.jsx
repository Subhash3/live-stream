import React, { useState, createContext } from 'react';

export const PeerStreamContext = createContext()

const PeerStreamProvider = (props) => {
    const [peerInfo, setPeerInfo] = useState(() => {
        return {
            myPeerID: null,
            myStream: null
        }
    })
    return (
        <PeerStreamContext.Provider
            value={[peerInfo, setPeerInfo]}
        >
            {props.children}
        </PeerStreamContext.Provider>
    );
}

export default PeerStreamProvider;
