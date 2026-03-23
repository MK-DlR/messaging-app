// frontend/src/pages/Register.jsx

// imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterUser() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState([]);

    const navigate = useNavigate();
    
    async function handleSubmit(e) {
        e.preventDefault();
        setError([]);

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
                {Array.isArray(error) &&
                    error.map((err, i) => <p key={i} className="errors">{err}</p>)}
            </div>
                <form onSubmit={handleSubmit}>
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
        </div>
    )
}

export default RegisterUser;