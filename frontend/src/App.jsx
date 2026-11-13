import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Index from "./Index.jsx";

import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import Account from "./components/Account.jsx";

import Header from "./components/Header.jsx";
import Footer from "./components/footer.jsx";
import { accountApi, auth } from "./utils/api.js";

import GardenDashboard from "./components/GardenDashboard.jsx";
import GardenEditor from "./components/GardenEditor.jsx";
import Plants from "./components/Plants.jsx";
import NativePlantRecommender from "./components/NativeRec.jsx"



function ProtectedRoute({ isAuthenticated, isGuest, setIsGuest }) {
    const [promptShown, setPromptShown] = useState(false);

    if (!isAuthenticated && !isGuest && !promptShown) {
        return (
            <div className="page-container">
                <section className="title-container">
                    <h1 className="outline">Restricted Access</h1>
                </section>
                <section className="app-container">
                    <section className="content-container">
                        <h2>You must log in to access this page. Or, continue as a guest:</h2>
                        <button className="button" onClick={() => {
                            setIsGuest(true);
                            setPromptShown(true);
                        }}>
                            Continue as Guest
                        </button>
                        <button className="button" onClick={() => window.location.href = "/login"}>
                            Go to Login
                        </button>
                    </section>
                </section>
            </div>
        );
    }
    return <GardenDashboard />;
}

function AppRouter() {
    const [isAuthenticated, setIsAuthenticated] = useState(auth.isLoggedIn());
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // "storage" covers other tabs; "auth-changed" is fired by the API client when a token is rejected.
        const checkAuth = () => setIsAuthenticated(auth.isLoggedIn());
        window.addEventListener("storage", checkAuth);
        window.addEventListener("auth-changed", checkAuth);
        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("auth-changed", checkAuth);
        };
    }, []);

    const handleLogout = () => {
        accountApi.logout().catch(() => {});
        auth.clear();
        setIsAuthenticated(false);
        setIsGuest(false);
        window.location.href = "/";
    };


    return (
        <Router>
            <div className="page-container">
                                 <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
                                 <Routes>
                                     <Route path="/" element={<Index />}  />
                                     <Route path="/nativeplantrecommender" element={<NativePlantRecommender />}  />
                                     <Route path="/login"  element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                                     <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                                     <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} setIsGuest={setIsGuest} />} />
                                     <Route path="/account" element={<Account />} />
                                     <Route path="/gardens/:id" element={<GardenEditor />} />
                                     <Route path="/plants/:id" element={<Plants />} />

                                     <Route
                                     path="/garden_app"
                                     element={
                                         <ProtectedRoute
                                             isAuthenticated={isAuthenticated}
                                             isGuest={isGuest}
                                             setIsGuest={setIsGuest}
                                         />
                                     }
                                 />
                                 <Route path="*" element={<Navigate to="/" />} />
                             </Routes>
                             <Footer />
                         </div>
        </Router>
    );
}

export default AppRouter;