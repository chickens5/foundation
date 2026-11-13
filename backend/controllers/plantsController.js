import * as plantService from '../services/plantService.js';

// The owner is always taken from the verified token; the service scopes every query to it.
export async function listPlants(req, res) {
    res.status(200).json(await plantService.listPlants(req.user.user_id, req.params.gardenId));
}

export async function createPlant(req, res) {
    res.status(201).json(await plantService.createPlant(req.user.user_id, req.params.gardenId, req.body));
}

export async function updatePlant(req, res) {
    const { gardenId, plantId } = req.params;
    res.status(200).json(await plantService.updatePlant(req.user.user_id, gardenId, plantId, req.body));
}

export async function deletePlant(req, res) {
    await plantService.deletePlant(req.user.user_id, req.params.gardenId, req.params.plantId);
    res.status(204).end();
}
