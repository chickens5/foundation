import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { accountApi, auth, errorMessage } from "../utils/api.js";

const Account = () => {
    const [account, setAccount] = useState(null);
    const [message, setMessage] = useState("");
    const loggedIn = auth.isLoggedIn();

    useEffect(() => {
        if (!loggedIn) return;
        accountApi.me()
            .then(setAccount)
            .catch((error) => setMessage(errorMessage(error, "Could not fetch account.")));
    }, [loggedIn]);

    if (!loggedIn) return <Navigate to="/login" replace />;

    return (
        <div className="page-container">
            <section className="app-container">
                <h1 className="outline">Your Account</h1>

                {message && <p className="error">{message}</p>}
                {account ? (
                    <div className="account-details">
                        <label>Username:</label>
                        <input type="text" value={account.username} disabled />
                    </div>
                ) : (
                    !message && <p>Loading account info...</p>
                )}
            </section>
        </div>
    );
};

export default Account;
