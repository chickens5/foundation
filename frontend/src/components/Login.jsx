import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountApi, auth, errorMessage } from "../utils/api.js";

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            auth.save(await accountApi.login(username, password));
            setIsAuthenticated(true);
            navigate("/account");
        } catch (error) {
            setMessage(errorMessage(error, "Login failed."));
        }
    };

    return (
        <div className="page-container">
            <section className="title-container">
                <h1>Login</h1>
            </section>
            <section className="app-container">
                <section className="content-container">
                    <h2 className="outline">Welcome Back!</h2>
                </section>
                <section className="login-container">
                    {message && <p className="message">{message}</p>}
                    <form onSubmit={handleLogin}>
                        <label>Username:</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                        <button type="submit" className="button">Login</button>
                    </form>

                </section>
            </section>
        </div>
    );
};
export default Login;