import * as gardenService from '../services/gardenService.js';

// verified tokens give
export async function listGardens(req, res) {
    res.status(200).json(await gardenService.listGardens(req.user.user_id));
}

export async function getGarden(req, res) {
    res.status(200).json(await gardenService.getGarden(req.user.user_id, req.params.gardenId));
}

export async function createGarden(req, res) {
    res.status(201).json(await gardenService.createGarden(req.user.user_id, req.body));
}

export async function updateGarden(req, res) {
    res.status(200).json(await gardenService.updateGarden(req.user.user_id, req.params.gardenId, req.body));
}

export async function deleteGarden(req, res) {
    await gardenService.deleteGarden(req.user.user_id, req.params.gardenId);
    res.status(204).end();
}
