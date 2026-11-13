import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountApi, auth, errorMessage } from "../utils/api.js";

const Register = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!username || !password || !confirmPassword) {
            setMessage("All fields are required!");
            setMessageType("error");
            return;
        }

        if (password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            setMessageType("error");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            setMessageType("error");
            return;
        }

        try {
            auth.save(await accountApi.register(username, password));
            setIsAuthenticated(true);

            setMessage("Registration successful! Redirecting...");
            setMessageType("success");
            setTimeout(() => navigate("/account"), 2000);
        } catch (error) {
            setMessage(errorMessage(error, "Registration failed."));
            setMessageType("error");
        }
    };

    return (
        <div className="page-container">
            <section className="title-container">
                <h1 className="outline">Register</h1>
            </section>
            <section className="app-container">
                <section className="content-container">
                    <h2 className="outline">Sign up today to connect with other Gardeners!</h2>
                </section>
                <section className="register-container">
                    <form onSubmit={handleSubmit}>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="button">Register</button>
                    </form>

                    {message && (
                        <div className={`message ${messageType}`}>
                            {message}
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
};

export default Register;
