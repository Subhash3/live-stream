import React, { useState, useEffect, useRef, useContext } from 'react';
import { CurrentUserContext } from '../../contexts/CurrentUserProvider.jsx'
import Landing from '../Landing/Landing.jsx'
import './LoginForm.min.css'

// const API = "localhost:3000/"

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        instructor: false
    })
    const [error, setError] = useState("")
    const usernameInputRef = useRef()
    const [currentUser, setCurrentUser] = useContext(CurrentUserContext)

    // console.log("In login component: ", { currentUser })

    useEffect(() => {
        usernameInputRef.current.focus()
    }, [])

    const handleUsernameChange = (e) => {
        let newFormData = { ...formData }
        newFormData.username = e.target.value
        setFormData(newFormData)
    }

    const handlePasswordChange = (e) => {
        let newFormData = { ...formData }
        newFormData.password = e.target.value
        setFormData(newFormData)
    }

    const instructorCheckBoxChange = (e) => {
        let newFormData = { ...formData }
        newFormData.instructor = e.target.checked
        setFormData(newFormData)
    }


    const resetForm = () => {
        let newFormData = { ...formData }
        newFormData.username = ""
        newFormData.password = ""
        setFormData(newFormData)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.username) {
            setError("username cannot be empty")
        } else if (!formData.password) {
            setError("Password cannot be empty")
        } else {
            let currentUserInfo = {
                username: formData.username,
                instructor: formData.instructor
            }

            setCurrentUser(currentUserInfo)
            resetForm()
            setError("")
        }
    }

    if (currentUser) {
        return <Landing />
    } else {
        return (
            <form onSubmit={handleSubmit} className="myform login-form">
                <div className="form-title">Login</div>
                <ErrorMsg error={error} />
                <div className="form-group">
                    <input
                        ref={usernameInputRef}
                        placeholder="username"
                        type="text"
                        value={formData.username}
                        onChange={handleUsernameChange}
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
                    <label> Instructor: </label>
                    <input
                        type="checkbox"
                        checked={formData.instructor}
                        onChange={instructorCheckBoxChange}
                    />
                </div>
                <div className="form-group">
                    <input type="submit" value="Log In" />
                </div>
            </form>
        );
    }
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
