import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginAPI } from '../api';
import { notify } from '../utils';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo({ ...loginInfo, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return notify('Email and password are required', 'error');
        }
        try {
            const response = await LoginAPI(loginInfo);
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
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to manage your tasks efficiently</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            value={loginInfo.email}
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
                            placeholder="Enter your password"
                            value={loginInfo.password}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">
                        Login
                    </button>
                    <p className="auth-switch">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
