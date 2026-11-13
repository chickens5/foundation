import {
    findPlantsForGarden,
    insertPlantForGarden,
    updatePlantForGarden,
    deletePlantForGarden,
} from '../repositories/plantRepo.js';
import { httpError } from './httpError.js';

const MAX_TEXT_LENGTH = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseId(id, label) {
    if (!/^\d+$/.test(String(id))) {
        throw httpError(400, `Invalid ${label} ID`);
    }
    return Number(id);
}

function optionalText(value, field) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') throw httpError(400, `${field} must be text`);
    const text = value.trim();
    if (text.length > MAX_TEXT_LENGTH) {
        throw httpError(400, `${field} must be ${MAX_TEXT_LENGTH} characters or fewer`);
    }
    return text || null;
}

function optionalDate(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
        throw httpError(400, 'Last watered must be a date (YYYY-MM-DD)');
    }
    return value;
}

function cleanPlant(body = {}) {
    const plant_name = optionalText(body.plant_name, 'Plant name');
    const growth_stage = optionalText(body.growth_stage, 'Growth stage');
    if (!plant_name || !growth_stage) {
        throw httpError(400, 'Plant name and growth stage are required');
    }
    return {
        plant_name,
        growth_stage,
        last_watered: optionalDate(body.last_watered),
        frequency: optionalText(body.frequency, 'Frequency'),
        category: optionalText(body.category, 'Category'),
    };
}

export function listPlants(userId, gardenId) {
    return findPlantsForGarden(parseId(gardenId, 'garden'), userId);
}

export async function createPlant(userId, gardenId, body) {
    const plant = await insertPlantForGarden(parseId(gardenId, 'garden'), userId, cleanPlant(body));
    if (!plant) throw httpError(404, 'Garden not found');
    return plant;
}

export async function updatePlant(userId, gardenId, plantId, body) {
    const plant = await updatePlantForGarden(
        parseId(plantId, 'plant'), parseId(gardenId, 'garden'), userId, cleanPlant(body)
    );
    if (!plant) throw httpError(404, 'Plant not found');
    return plant;
}

export async function deletePlant(userId, gardenId, plantId) {
    const deleted = await deletePlantForGarden(parseId(plantId, 'plant'), parseId(gardenId, 'garden'), userId);
    if (!deleted) throw httpError(404, 'Plant not found');
}
