// PostgreSQL query repository for the plants table
// (id, garden_id, plant_name, growth_stage, last_watered, frequency, category).
// Every query joins to gardens and filters on user_id, so a plant is only reachable through its owner's garden.
import pool from '../services/db.js'

const COLUMNS = 'p.id, p.garden_id, p.plant_name, p.growth_stage, p.last_watered::date::text AS last_watered, p.frequency, p.category';

export async function findPlantsForGarden(gardenId, userId) {
    const result = await pool.query(
        `SELECT ${COLUMNS}
         FROM plants p JOIN gardens g ON g.garden_id = p.garden_id
         WHERE p.garden_id = $1 AND g.user_id = $2
         ORDER BY p.id`,
        [gardenId, userId]
    );
    return result.rows;
}

// Returns null when the garden doesn't exist or isn't owned by the user.
export async function insertPlantForGarden(gardenId, userId, plant) {
    const result = await pool.query(
        `INSERT INTO plants (garden_id, plant_name, growth_stage, last_watered, frequency, category)
         SELECT g.garden_id, $3, $4, $5, $6, $7 FROM gardens g WHERE g.garden_id = $1 AND g.user_id = $2
         RETURNING id, garden_id, plant_name, growth_stage, last_watered::date::text AS last_watered, frequency, category`,
        [gardenId, userId, plant.plant_name, plant.growth_stage, plant.last_watered, plant.frequency, plant.category]
    );
    return result.rows[0] || null;
}

export async function updatePlantForGarden(plantId, gardenId, userId, plant) {
    const result = await pool.query(
        `UPDATE plants p
         SET plant_name = $4, growth_stage = $5, last_watered = $6, frequency = $7, category = $8
         FROM gardens g
         WHERE p.id = $1 AND p.garden_id = $2 AND g.garden_id = p.garden_id AND g.user_id = $3
         RETURNING ${COLUMNS}`,
        [plantId, gardenId, userId, plant.plant_name, plant.growth_stage, plant.last_watered, plant.frequency, plant.category]
    );
    return result.rows[0] || null;
}

export async function deletePlantForGarden(plantId, gardenId, userId) {
    const result = await pool.query(
        `DELETE FROM plants p USING gardens g
         WHERE p.id = $1 AND p.garden_id = $2 AND g.garden_id = p.garden_id AND g.user_id = $3`,
        [plantId, gardenId, userId]
    );
    return result.rowCount > 0;
}
