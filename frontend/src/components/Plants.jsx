import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { auth, gardenApi, plantApi, errorMessage } from "../utils/api.js";

const EMPTY_FORM = { plant_name: "", growth_stage: "", last_watered: "", frequency: "", category: "" };

const toForm = (plant) => ({
    plant_name: plant.plant_name || "",
    growth_stage: plant.growth_stage || "",
    last_watered: plant.last_watered || "",
    frequency: plant.frequency || "",
    category: plant.category || "",
});

const Plants = () => {
    const { id: gardenId } = useParams();
    const loggedIn = auth.isLoggedIn();
    const [garden, setGarden] = useState(null);
    const [plants, setPlants] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingPlantId, setEditingPlantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!loggedIn) return;
        Promise.all([gardenApi.get(gardenId), plantApi.list(gardenId)])
            .then(([gardenData, plantData]) => {
                setGarden(gardenData);
                setPlants(Array.isArray(plantData) ? plantData : []);
            })
            .catch((err) => setError(errorMessage(err, "Failed to load plants.")))
            .finally(() => setLoading(false));
    }, [gardenId, loggedIn]);

    const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingPlantId(null);
    };

    const savePlant = async (e) => {
        e.preventDefault();
        if (!form.plant_name.trim() || !form.growth_stage.trim()) {
            setError("Please enter plant name and growth stage.");
            return;
        }

        try {
            if (editingPlantId) {
                const updated = await plantApi.update(gardenId, editingPlantId, form);
                setPlants((prev) => prev.map((p) => (p.id === editingPlantId ? updated : p)));
                setSuccessMessage("Plant updated!");
            } else {
                const created = await plantApi.create(gardenId, form);
                setPlants((prev) => [...prev, created]);
                setSuccessMessage("Plant added successfully!");
            }
            setError(null);
            resetForm();
        } catch (err) {
            setSuccessMessage("");
            setError(errorMessage(err, "Failed to save plant."));
        }
    };

    const startEdit = (plant) => {
        setEditingPlantId(plant.id);
        setForm(toForm(plant));
    };

    const deletePlant = async (plantId) => {
        try {
            await plantApi.remove(gardenId, plantId);
            setPlants((prev) => prev.filter((p) => p.id !== plantId));
            if (plantId === editingPlantId) resetForm();
            setError(null);
            setSuccessMessage("Plant deleted successfully!");
        } catch (err) {
            setSuccessMessage("");
            setError(errorMessage(err, "Failed to delete plant."));
        }
    };

    if (!loggedIn) return <Navigate to="/login" replace />;
    if (loading) return <p className="loading-message">🌱 Loading plants...</p>;
    // The garden itself failed to load (not found / not yours), so there is nothing to show.
    if (!garden) return <div className="page-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="page-container">
            <section className="garden-header">
                <h1 className="outline">{garden.garden_name}</h1>
                <Link to="/garden_app" className="button">Back to gardens</Link>
            </section>

            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}

            <form className="plant-form" onSubmit={savePlant}>
                <input type="text" placeholder="Plant Name" value={form.plant_name} maxLength={100}
                       onChange={setField("plant_name")} />
                <input type="text" placeholder="Growth Stage" value={form.growth_stage} maxLength={100}
                       onChange={setField("growth_stage")} />
                <input type="date" placeholder="Last Watered" value={form.last_watered}
                       onChange={setField("last_watered")} />
                <input type="text" placeholder="Watering Frequency" value={form.frequency} maxLength={100}
                       onChange={setField("frequency")} />
                <input type="text" placeholder="Category" value={form.category} maxLength={100}
                       onChange={setField("category")} />
                <button type="submit" className="button">
                    {editingPlantId ? "💾 Update Plant" : "🌱 Add Plant"}
                </button>
                {editingPlantId && <button type="button" className="button" onClick={resetForm}>Cancel</button>}
            </form>

            <section className="plants-container">
                {plants.length === 0 ? (
                    <p>No plants found in this garden.</p>
                ) : (
                    <div className="plants-grid">
                        {plants.map((plant) => (
                            <div key={plant.id} className="plant-card">
                                <h3>{plant.plant_name}</h3>
                                <p>Growth Stage: {plant.growth_stage}</p>
                                <p>Last Watered: {plant.last_watered || "N/A"}</p>
                                <p>Frequency: {plant.frequency || "N/A"}</p>
                                <p>Category: {plant.category || "N/A"}</p>
                                <button className="button" onClick={() => startEdit(plant)}>Edit</button>
                                <button className="button delete-btn" onClick={() => deletePlant(plant.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Plants;
