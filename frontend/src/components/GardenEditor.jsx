import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { auth, gardenApi, errorMessage } from "../utils/api.js";

const GardenEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const loggedIn = auth.isLoggedIn();
    const [gardenName, setGardenName] = useState("");
    const [gardenType, setGardenType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!loggedIn) return;
        gardenApi.get(id)
            .then((garden) => {
                setGardenName(garden.garden_name);
                setGardenType(garden.garden_type);
            })
            .catch((err) => setError(errorMessage(err, "Failed to load garden.")))
            .finally(() => setLoading(false));
    }, [id, loggedIn]);

    const saveGarden = async (e) => {
        e.preventDefault();
        if (!gardenName.trim()) {
            setError("Garden name is required!");
            return;
        }
        try {
            const updated = await gardenApi.update(id, { garden_name: gardenName, garden_type: gardenType });
            setGardenName(updated.garden_name);
            setGardenType(updated.garden_type);
            setError(null);
            setSuccessMessage("Garden updated successfully!");
        } catch (err) {
            setSuccessMessage("");
            setError(errorMessage(err, "Failed to update garden."));
        }
    };

    if (!loggedIn) return <Navigate to="/login" replace />;
    if (loading) return <p className="loading-message">Loading garden...</p>;

    return (
        <div className="page-container">
            <section className="title-container">
                <h1 className="outline">Edit Garden</h1>
            </section>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={saveGarden}>
                <h5>Garden Name:</h5>
                <input type="text" value={gardenName} maxLength={100} onChange={(e) => setGardenName(e.target.value)} />
                <h5>Garden Type:</h5>
                <input type="text" value={gardenType} maxLength={50} onChange={(e) => setGardenType(e.target.value)} />
                <button type="submit" className="btn">Save</button>
                <button type="button" className="btn" onClick={() => navigate("/garden_app")}>Back</button>
            </form>
        </div>
    );
};

export default GardenEditor;
