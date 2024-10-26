// src/routes/promoRoutes.js
import express from 'express';
import PromoController from '../controllers/PromoController.js';

const router = express.Router();

// Routes pour les promotions
router.post('/promos', PromoController.create); // Créer une promotion
router.get('/promos', PromoController.getAll); // Récupérer toutes les promotions
router.get('/promos/:id', PromoController.getById); // Récupérer une promotion par ID
router.put('/promos/:id', PromoController.update); // Mettre à jour une promotion
router.delete('/promos/:id', PromoController.delete); // Supprimer une promotion

export default router;
