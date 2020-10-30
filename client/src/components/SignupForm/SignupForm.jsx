import React, { useState, useEffect, useRef } from 'react';
import '../LoginForm/LoginForm.min.css'

const API = "localhost:3000/"

const SignupForm = () => {
    const [formData, setFormData] = useState({
        userID: "",
        password: ""
    })
    const [error, setError] = useState("")
    const userIDInputRef = useRef()

    useEffect(() => {
        userIDInputRef.current.focus()
    }, [])

    const handleUserIDChange = (e) => {
        let newFormData = { ...formData }
        newFormData.userID = e.target.value
        setFormData(newFormData)
    }

    const handlePasswordChange = (e) => {
        let newFormData = { ...formData }
        newFormData.password = e.target.value
        setFormData(newFormData)
    }

    const resetForm = () => {
        let newFormData = { ...formData }
        newFormData.userID = ""
        newFormData.password = ""
        setFormData(newFormData)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.userID) {
            setError("userID cannot be empty")
        } else if (!formData.password) {
            setError("Password cannot be empty")
        } else {
            resetForm()
            setError("")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="myform login-form">
            <div className="form-title">Sign UP</div>
            <ErrorMsg error={error} />
            <div className="form-group">
                <input
                    ref={userIDInputRef}
                    placeholder="userID"
                    type="text"
                    value={formData.userID}
                    onChange={handleUserIDChange}
                />
            </div>
            <div className="form-group">
                <input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                />
            </div>
            <div className="form-group">
                <input type="submit" value="Signup" />
            </div>
        </form>
    );
}

const ErrorMsg = ({ error }) => {
    const styles = {
        color: "red",
        fontStyle: "italic",
        fontSize: '12px',
        margin: '5px auto',
        textTransform: 'capitalize'
    }
    return (
        <p className="error" style={styles}>{error}</p>
    )
}

export default LoginForm;
