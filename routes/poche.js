// routes/poche.js
import express from 'express';
import PocheController from '../controllers/PocheController.js';

const router = express.Router();

// Création d'une nouvelle poche
router.post('/create', PocheController.createPoche);

// Effectuer un transfert depuis une poche
router.post('/transfer', PocheController.transferFromPoche);

// Mettre à jour une poche (date limite ou montant)
router.patch('/:poche_id', PocheController.updatePoche);

// Récupérer toutes les poches de l'utilisateur
router.get('/', PocheController.getAllPoches);

export default router;