import React, { useRef, useEffect } from 'react';
import './VideosContainer.min.css'

const VideosContainer = () => {
    const localVideoRef = useRef() // Ref to acess local video element

    useEffect(() => {
        const constraints = {
            video: true,
            audio: true,
        }

        const getUserMedia = () => {
            navigator.mediaDevices.getUserMedia(constraints)
                .then(gotUserMedia)
                .catch(failedToGetUserMedia)
        }

        getUserMedia()
    }, [])

    const gotUserMedia = (stream) => {
        console.log("Got user media")
        localVideoRef.current.srcObject = stream
    }

    const failedToGetUserMedia = (error) => {
        console.log("Failed to get user media ", error)
    }

    return (
        <div className="videos-container">
            <video
                style={{
                    transform: "rotateY(180deg)",
                    width: 480,
                    heoght: 720
                }}
                ref={localVideoRef}
                autoPlay
                muted
            >
            </video>
        </div>
    );
}

export default VideosContainer;
