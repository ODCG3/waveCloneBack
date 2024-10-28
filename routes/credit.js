// routes/credit.js
import express from 'express';
import CreditController from '../controllers/CreditController.js';
const router = express.Router();

router.post('/achat', CreditController.achatCredit);
router.get('/historique', CreditController.getHistorique);
router.get('/:id', CreditController.getAchatById);

export default router;