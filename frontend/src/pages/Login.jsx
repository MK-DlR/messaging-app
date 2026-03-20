// frontend/src/pages/Login.jsx

// imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/login`, 
            { 
                method: "POST", 
                headers: {"Content-Type": "application/json" }, 
                body: JSON.stringify({ username, password })
            }
        )
        const data = await response.json();

        // check response
        if (!response.ok) {
            setError(data.error);
        } else {
            // if successful login, store JWT token
            localStorage.setItem("token", data.token)
            // redirect to home
            navigate("/");
        }
    }

    return (
        <div className="login-page">
            <div className="login form">
            <div className="error-display">{error && <p className="errors">{error}</p>}</div>
                <form onSubmit={handleSubmit}>
                    <label>Username:
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </label>
                    <label>Password:
                        <input 
                            className="password-input"
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </label>
                    <button className="submit button" type="submit">Login</button>
                </form>
                <div className="register-here">Don't have an account? Register <a href="/register">here</a>.</div>
            </div>
        </div>
    )
}

export default Login;