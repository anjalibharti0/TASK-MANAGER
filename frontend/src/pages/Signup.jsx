import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignupAPI } from '../api';
import { notify } from '../utils';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo({ ...signupInfo, [name]: value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return notify('Name, email, and password are required', 'error');
        }
        try {
            const response = await SignupAPI(signupInfo);
            const { success, message, jwtToken, name, error } = response;
            if (success) {
                notify(message, 'success');
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else if (error) {
                const details = error?.details?.[0]?.message || message;
                notify(details, 'error');
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            notify(err.message || 'Something went wrong', 'error');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join us to start organizing your work</p>
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your full name"
                            value={signupInfo.name}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            value={signupInfo.email}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Create a strong password"
                            value={signupInfo.password}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">
                        Sign Up
                    </button>
                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Signup;
