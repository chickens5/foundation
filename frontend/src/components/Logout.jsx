import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { accountApi, auth } from "../utils/api.js";

const Logout = ({ setIsAuthenticated, setIsGuest }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const username = auth.getUsername() || "Guest";

        if (!window.confirm(`Are you sure you want to log out, ${username}?`)) {
            navigate("/account");
            return;
        }

        // Tokens are stateless, so the local clear is what actually ends the session; the server call is best-effort.
        accountApi.logout().catch(() => {}).finally(() => {
            auth.clear();
            setIsAuthenticated(false);
            setIsGuest?.(true);
            setMessage("Successfully logged out! Come back soon!");
            setTimeout(() => navigate("/"), 1500);
        });
    }, [navigate, setIsAuthenticated, setIsGuest]);

    return (
        <div className="page-container">
            <section className="app-container">
                <h1 className="outline">Logout</h1>
                {message && <p className="success">{message}</p>}
            </section>
        </div>
    );
};

export default Logout;
