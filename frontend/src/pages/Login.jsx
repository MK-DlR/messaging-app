// frontend/src/pages/Login.jsx

// imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import useApi from "../helpers/useApi";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const { isCheckingApi, isApiReady } = useApi();

    if (isCheckingApi) {
        return <div>Loading...</div>;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // block submission if API isn't ready
        if (isCheckingApi) {
            setError("Backend is still loading. Please wait...");
            return;
        }

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

    async function handleGuestLogin() {
        // block submission if API isn't ready
        if (isCheckingApi) {
            setError("Backend is still loading. Please wait...");
            return;
        }

        const confirmed = window.confirm(
            "This is a demo account for guest use. Some functionality may not be available. " +
            "Please note that anyone is able to access this demo account.\n\n" +
            "Continue as guest?"
        );
        
        if (!confirmed) return;

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/guest-login`, 
            { 
                method: "POST", 
                headers: {"Content-Type": "application/json" }, 
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
        <div 
            className="login-page"
            style={{
                backgroundImage: "url('/backgrounds/shapes.gif')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="login form form-no-users">
                <div className="error-display">
                    {!isApiReady && (
                        <div className="loading-state">
                            <Spinner />
                            <div>
                                {isCheckingApi ? "Checking server..." : "Server not responding."}
                            </div>
                        </div>
                    )}

                    {error && <p className="errors">{error}</p>}
                </div>
                <form 
                    onSubmit={handleSubmit}
                    style={{ pointerEvents: !isApiReady ? "none" : "auto", opacity: !isApiReady ? 0.5 : 1 }}
                >
                    <label>Username
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </label>
                    <label>Password
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
                <button 
                    className="guest button"
                    onClick={handleGuestLogin}
                    style={{ opacity: !isApiReady ? 0.5 : 1 }}
                    disabled={!isApiReady}
                >
                    Login As Guest
                </button>
                <div className="register-here">Don't have an account? Register <a href="/register">here</a>.</div>
            </div>
            <div className="footer"><a href="https://github.com/MK-DlR">Created by <i class="fa-brands fa-github" /> MK-DlR</a></div>
        </div>
    )
}

export default Login;