// routes/credit.js
import express from 'express';
import CreditController from '../controllers/CreditController.js';
import auth from '../middleware/auth.js';
const router = express.Router();

//router.post('/achat', CreditController.achatCredit);
//router.get('/historique', CreditController.getHistorique);
//router.get('/:id', CreditController.getAchatById);


router.route('/achat')
  .post(auth, (req, res) => CreditController.achatCredit(req, res));


  router.route('/historique')
  .get(auth, (req, res) => CreditController.getHistorique(req, res));

  router.route('/:id')
  .get(auth, (req, res) => CreditController.getAchatById(req, res));

export default router;