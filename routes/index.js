import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

// Define each endpoints using the valid routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStat);

export default router;
