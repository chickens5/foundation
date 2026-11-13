// PostgreSQL query repository for the gardens table (garden_id, user_id, garden_name, garden_type, image_id).
// Every query is scoped by user_id so a user can never read or change another user's garden.
import pool from '../services/db.js'

// The API exposes the key as `id`
const COLUMNS = 'garden_id AS id, user_id, garden_name, garden_type, image_id';

export async function findGardensByUser(userId) {
    const result = await pool.query(
        `SELECT ${COLUMNS} FROM gardens WHERE user_id = $1 ORDER BY garden_id`,
        [userId]
    );
    return result.rows;
}

export async function findGardenForUser(gardenId, userId) {
    const result = await pool.query(
        `SELECT ${COLUMNS} FROM gardens WHERE garden_id = $1 AND user_id = $2`,
        [gardenId, userId]
    );
    return result.rows[0] || null;
}

export async function insertGarden(userId, gardenName, gardenType) {
    const result = await pool.query(
        `INSERT INTO gardens (user_id, garden_name, garden_type) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
        [userId, gardenName, gardenType]
    );
    return result.rows[0];
}

// Null name/type keeps the stored value.
export async function updateGardenForUser(gardenId, userId, gardenName, gardenType) {
    const result = await pool.query(
        `UPDATE gardens
         SET garden_name = COALESCE($3, garden_name), garden_type = COALESCE($4, garden_type)
         WHERE garden_id = $1 AND user_id = $2
         RETURNING ${COLUMNS}`,
        [gardenId, userId, gardenName, gardenType]
    );
    return result.rows[0] || null;
}

export async function deleteGardenForUser(gardenId, userId) {
    const result = await pool.query(
        'DELETE FROM gardens WHERE garden_id = $1 AND user_id = $2',
        [gardenId, userId]
    );
    return result.rowCount > 0;
}
