import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import * as account from './controllers/accountController.js';
import * as gardens from './controllers/gardensController.js';
import * as plants from './controllers/plantsController.js';
import { requireAuth, requireOwnAccount } from './middleware/auth.js';
import { asyncHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
// Restricts cross-origin requests to the known frontend origin
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

//--- Login + Register ---
app.post('/api/register', asyncHandler(account.register));
app.post('/api/login', asyncHandler(account.login));
app.post('/api/logout', account.logout);

//-- BY account/:id --
// Must stay above /:id so "me" is not treated as an id
app.get('/api/account/me', requireAuth, asyncHandler(account.getMyAccount));
app.get('/api/account/:id', requireOwnAccount, asyncHandler(account.getAccountById));

//-- Gardens (always scoped to the authenticated user) --
app.get('/api/gardens', requireAuth, asyncHandler(gardens.listGardens));
app.post('/api/gardens', requireAuth, asyncHandler(gardens.createGarden));
app.get('/api/gardens/:gardenId', requireAuth, asyncHandler(gardens.getGarden));
app.put('/api/gardens/:gardenId', requireAuth, asyncHandler(gardens.updateGarden));
app.delete('/api/gardens/:gardenId', requireAuth, asyncHandler(gardens.deleteGarden));

app.get('/api/gardens/:gardenId/plants', requireAuth, asyncHandler(plants.listPlants));
app.post('/api/gardens/:gardenId/plants', requireAuth, asyncHandler(plants.createPlant));
app.put('/api/gardens/:gardenId/plants/:plantId', requireAuth, asyncHandler(plants.updatePlant));
app.delete('/api/gardens/:gardenId/plants/:plantId', requireAuth, asyncHandler(plants.deletePlant));

app.use(errorHandler);

// Default matches the Vite dev proxy target in frontend/vite.config.js
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
