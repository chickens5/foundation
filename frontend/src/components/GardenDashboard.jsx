import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, gardenApi, errorMessage } from "../utils/api.js";

const GardenDashboard = () => {
    const [gardens, setGardens] = useState([]);
    const [gardenName, setGardenName] = useState("");
    const [gardenType, setGardenType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const loggedIn = auth.isLoggedIn();

    useEffect(() => {
        if (!loggedIn) {
            setError("Please log in to manage your gardens.");
            setLoading(false);
            return;
        }

        gardenApi.list()
            .then((data) => setGardens(Array.isArray(data) ? data : []))
            .catch((err) => setError(errorMessage(err, "Failed to load gardens.")))
            .finally(() => setLoading(false));
    }, [loggedIn]);

    const createGarden = async (e) => {
        e.preventDefault();
        if (!gardenName.trim()) {
            setError("Garden name is required!");
            return;
        }

        try {
            const newGarden = await gardenApi.create({
                garden_name: gardenName,
                garden_type: gardenType || undefined,
            });
            setGardens((prev) => [...prev, newGarden]);
            setGardenName("");
            setGardenType("");
            setError(null);
            setSuccessMessage("Garden created!");
        } catch (err) {
            setSuccessMessage("");
            setError(errorMessage(err, "Failed to create garden."));
        }
    };

    const deleteGarden = async (gardenId) => {
        if (!window.confirm("Delete this garden?")) return;
        try {
            await gardenApi.remove(gardenId);
            setGardens((prev) => prev.filter((g) => g.id !== gardenId));
            setSuccessMessage("Garden deleted.");
            setError(null);
        } catch (err) {
            setSuccessMessage("");
            setError(errorMessage(err, "Failed to delete garden."));
        }
    };

    if (loading) return <p className="loading-message"> Loading your gardens...</p>;
    if (!loggedIn) return <div className="page-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="page-container">
            <section className="title-container">
                <h1 className="outline">Manage Your Gardens</h1>
            </section>
            <h2>Create a Garden below to get started!</h2>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={createGarden}>
                <h5>Garden Name:</h5>
                <input
                    type="text"
                    value={gardenName}
                    maxLength={100}
                    onChange={(e) => setGardenName(e.target.value)}
                />
                <h5>Garden Type:</h5>
                <input
                    type="text"
                    value={gardenType}
                    maxLength={50}
                    placeholder="soil"
                    onChange={(e) => setGardenType(e.target.value)}
                />
                <button type="submit" className="btn">Create Garden</button>
            </form>

            <div className="gardens-grid">
                {gardens.length === 0 ? (
                    <p className="no-gardens-message">No gardens found. Start by creating one!</p>
                ) : (
                    gardens.map((garden) => (
                        <div key={garden.id} className="garden-card">
                            <div className="garden-card-overlay">
                                <h3 className="garden-title">{garden.garden_name}</h3>
                                <p>Type: {garden.garden_type}</p>

                                <Link to={`/plants/${garden.id}`} className="button">Plants</Link>
                                <Link to={`/gardens/${garden.id}`} className="button edit-btn">Edit</Link>
                                <button className="button delete-btn" onClick={() => deleteGarden(garden.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GardenDashboard;
