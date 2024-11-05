// routes/credit.js
import express from 'express';
import CreditController from '../controllers/CreditController.js';
import auth from "../middleware/auth.js";
const router = express.Router();

router.route('/achatcredit')
    .post(auth, (req, res) => CreditController.achatCredit(req, res));
router.get('/historique', CreditController.getHistorique);
router.get('/:id', CreditController.getAchatById);

export default router;