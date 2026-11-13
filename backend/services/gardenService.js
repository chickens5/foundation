import {
    findGardensByUser,
    findGardenForUser,
    insertGarden,
    updateGardenForUser,
    deleteGardenForUser,
} from '../repositories/gardenRepo.js';
import { httpError } from './httpError.js';

const MAX_NAME_LENGTH = 100;
const MAX_TYPE_LENGTH = 50;

function parseGardenId(id) {
    if (!/^\d+$/.test(String(id))) {
        throw httpError(400, 'Invalid garden ID');
    }
    return Number(id);
}

// Returns the trimmed text, or undefined when the field was not supplied.
function cleanText(value, field, maxLength, { required }) {
    if (value === undefined || value === null) {
        if (required) throw httpError(400, `${field} is required`);
        return undefined;
    }
    if (typeof value !== 'string') {
        throw httpError(400, `${field} must be text`);
    }
    const text = value.trim();
    if (required && !text) throw httpError(400, `${field} is required`);
    if (text.length > maxLength) {
        throw httpError(400, `${field} must be ${maxLength} characters or fewer`);
    }
    return text;
}

export function listGardens(userId) {
    return findGardensByUser(userId);
}

export async function getGarden(userId, id) {
    const garden = await findGardenForUser(parseGardenId(id), userId);
    if (!garden) throw httpError(404, 'Garden not found');
    return garden;
}

export function createGarden(userId, { garden_name, garden_type } = {}) {
    const name = cleanText(garden_name, 'Garden name', MAX_NAME_LENGTH, { required: true });
    const type = cleanText(garden_type, 'Garden type', MAX_TYPE_LENGTH, { required: false }) || 'soil';
    return insertGarden(userId, name, type);
}

export async function updateGarden(userId, id, { garden_name, garden_type } = {}) {
    const gardenId = parseGardenId(id);
    const name = cleanText(garden_name, 'Garden name', MAX_NAME_LENGTH, { required: false });
    const type = cleanText(garden_type, 'Garden type', MAX_TYPE_LENGTH, { required: false });
    if (name === '') throw httpError(400, 'Garden name is required');

    const garden = await updateGardenForUser(gardenId, userId, name ?? null, type || null);
    if (!garden) throw httpError(404, 'Garden not found');
    return garden;
}

export async function deleteGarden(userId, id) {
    const deleted = await deleteGardenForUser(parseGardenId(id), userId);
    if (!deleted) throw httpError(404, 'Garden not found');
}
