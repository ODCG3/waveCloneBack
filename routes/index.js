import express from 'express';
import UserController from '../controllers/UserController.js';
import PaymentController from '../controllers/PaymentController.js';
import BillPaymentController from '../controllers/BillPaymentController.js';
import MerchantPaymentController from '../controllers/MerchantPaymentController.js';
import CardController from '../controllers/CardController.js';


const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Example endpoint
router.get('/example', (req,res) => UserController.getAll(req,res));

// Endpoint pour effectuer un paiement marchand
router.post('/merchant-payment', (req, res) => MerchantPaymentController.payMerchant(req, res));


//endpoint pour le paiement d'un facture 
router.post('/bill-payment', (req, res) => BillPaymentController.payBill(req, res));


//endpoint pour verouiller la carte en cas de perte
router.post('/card/lock', (req, res) => CardController.lockCard(req, res));

// Export the router
export default router;