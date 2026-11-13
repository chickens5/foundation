import { registerUser, loginUser, getAccount } from '../services/accountService.js';

export async function register(req, res) {
    const newUser = await registerUser(req.body);
    res.status(201).json(newUser);
}

export async function login(req, res) {
    const loggedInUser = await loginUser(req.body);
    res.status(200).json(loggedInUser);
}

// Tokens are stateless; logging out means the client discards its token.
export function logout(req, res) {
    res.status(200).json({ message: 'Logged out successfully!' });
}

export async function getMyAccount(req, res) {
    const user = await getAccount(req.user.user_id);
    res.status(200).json(user);
}

export async function getAccountById(req, res) {
    const user = await getAccount(req.params.id);
    res.status(200).json(user);
}
