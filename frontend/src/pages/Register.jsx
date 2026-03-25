// frontend/src/pages/Register.jsx

// imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import useApi from "../helpers/useApi";

function RegisterUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState([]);

    const navigate = useNavigate();

    const { isCheckingApi, isApiReady } = useApi();

    if (isCheckingApi) {
        return <div>Loading...</div>;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError([]);

        // block submission if API isn't ready
        if (isCheckingApi) {
            setError("Backend is still loading. Please wait...");
            return;
        }

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/register`, 
            { 
                method: "POST", 
                headers: {"Content-Type": "application/json" }, 
                body: JSON.stringify({ username, password, confirmPassword })
            }
        );
    
        const data = await response.json();

        // check response
        if (!response.ok) {
            setError(data.error);
        } else {
            navigate("/login");
        }
    }

    return (
        <div 
            className="register-page"
            style={{
                backgroundImage: "url('/backgrounds/shapes.gif')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="register form form-no-users">
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
                            placeholder="Enter a username"
                        />
                    </label>
                    <label>Password
                        <input 
                            className="password-input"
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a password"
                        />
                    </label>
                    <label>Confirm Password
                        <input 
                            className="password-input"
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                        />
                    </label>
                    <button className="submit button" type="submit">Register</button>
                </form>
                <div className="login-here">Already have an account? Login <a href="/login">here</a>.</div>
            </div>
            <div className="footer"><a href="https://github.com/MK-DlR">Created by <i class="fa-brands fa-github" /> MK-DlR</a></div>
        </div>
    )
}

export default RegisterUser;