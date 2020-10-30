import React, { useRef, useEffect } from 'react';

const VideoStream = (props) => {
    const videoRef = useRef()
    console.log("Rendeting VideoStream")

    useEffect(() => {
        if (typeof (props.stream) !== "number") {
            videoRef.current.srcObject = props.stream
            console.log("Streamer ID: ", props.id)
            console.log("Stream: ", props.stream)
        }
        videoRef.current.addEventListener('loadedmetadata', (e) => {
            console.log("Loaded metadata")
            videoRef.current.play()
        })
    }, [props.stream, props.id])

    return (
        <div className="stream">
            <p className="streamer-id">{props.id}</p>
            <video
                // autoPlay
                controls
                muted
                ref={videoRef}
                className="video-stream"
            ></video>
        </div>
    )
}


export default VideoStream;
