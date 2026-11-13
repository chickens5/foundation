// accountService.js ~ ~ GJ 9/19/26 1800 

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername, insertUser, findAccountById } from '../repositories/accountRepo.js';
import { JWT_SECRET } from './jwtSecret.js';
import { httpError } from './httpError.js';

const TOKEN_TTL = "1d";
const BCRYPT_ROUNDS = 10;
const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt ignores everything past 72 bytes
const PG_UNIQUE_VIOLATION = "23505";

// Compared against when the username doesn't exist so response time doesn't reveal which usernames are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

function signToken(user_id, username) {
    return jwt.sign({ user_id, username }, JWT_SECRET, { algorithm: "HS256", expiresIn: TOKEN_TTL });
}

// Register & Login User
export async function registerUser({ username, password } = {}) {
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
        throw httpError(400, "All fields are required!");
    }
    username = username.trim();
    if (!USERNAME_PATTERN.test(username)) {
        throw httpError(400, "Username must be 3-30 characters: letters, numbers, '.', '_' or '-'.");
    }
    if (password.length < MIN_PASSWORD_LENGTH || Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
        throw httpError(400, `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_BYTES} bytes long.`);
    }

    if (await findUserByUsername(username)) {
        throw httpError(409, "Username already taken.");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    let user_id;
    try {
        user_id = await insertUser(username, hashedPassword);
    } catch (error) {
        // Lost a race with a concurrent registration of the same username
        if (error.code === PG_UNIQUE_VIOLATION) throw httpError(409, "Username already taken.");
        throw error;
    }

    return {
        message: "User registered successfully!",
        user_id,
        username,
        access_token: signToken(user_id, username),
    };
}

export async function loginUser({ username, password } = {}) {
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
        throw httpError(400, "Username and password are required.");
    }

    const user = await findUserByUsername(username.trim());
    const validPassword = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !validPassword) {
        throw httpError(401, "Incorrect username or password");
    }

    return {
        message: "Login successful!",
        access_token: signToken(user.user_id, user.username),
        user_id: user.user_id,
        username: user.username,
    };
}

// Get Account by ID
export async function getAccount(id) {
    if (!/^\d+$/.test(String(id))) {
        throw httpError(400, "Invalid user ID");
    }

    const account = await findAccountById(Number(id));
    if (!account) {
        throw httpError(404, "User account not found");
    }

    return account;
}
