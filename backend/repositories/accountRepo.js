// PostgreSQL query repository for the users table (user_id, username, password)
import pool from '../services/db.js'

/* REGISTER + LOGIN  */
export async function findUserByUsername(username) {
    const result = await pool.query(
        'SELECT user_id, username, password FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0] || null;
}

export async function insertUser(username, hashedPassword) {
    const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id',
        [username, hashedPassword]
    );
    return result.rows[0].user_id;
}

/* GET ACCOUNT BY ID */
export async function findAccountById(userId) {
    const result = await pool.query(
        'SELECT user_id, username FROM users WHERE user_id = $1',
        [userId]
    );
    return result.rows[0] || null;
}
