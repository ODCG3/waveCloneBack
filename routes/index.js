import express from 'express';
import UserController from '../controllers/UserController.js';

import auth from '../middleware/auth.js';

import PaymentController from '../controllers/PaymentController.js';
import BillPaymentController from '../controllers/BillPaymentController.js';
import MerchantPaymentController from '../controllers/MerchantPaymentController.js';
import CardController from '../controllers/CardController.js';



import TransactionController from '../controllers/TransactionController.js';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.route('/depot')
  .post(auth, (req, res) => TransactionController.depot(req, res));

router.route('/retrait')
  .post(auth, (req, res) => TransactionController.retrait(req, res));

router.route('/user/create')
  .post(auth, (req, res) => UserController.create(req, res));

router.route('/login')
  .post((req, res) => UserController.login(req, res));

router.route('/logout')
  .post((req, res) => UserController.logout(req, res));

router.route('/reinitializeCode')
  .post(auth, (req, res) => UserController.reinitializeCode(req, res));


//Issues endpoint
router.route('/users/reportIssue')
.post(auth, (req, res) => UserController.reportIssue(req, res));

router.route('/admin/respondIssue')
.post(auth, (req, res) => UserController.respondToIssueInApp(req, res));

router.route('/transferer')
  .post(auth, (req, res) => TransactionController.transfert(req, res));


// Example endpoint


router.get('/users', (req,res) => UserController.getAll(req,res));

router.get('/users', (req, res) => UserController.getAll(req, res));


router.get('/example', (req,res) => UserController.getAll(req,res));

// Endpoint pour effectuer un paiement marchand
router.post('/merchant-payment', (req, res) => MerchantPaymentController.payMerchant(req, res));


//endpoint pour le paiement d'un facture 
router.post('/bill-payment', (req, res) => BillPaymentController.payBill(req, res));


//endpoint pour verouiller la carte en cas de perte
router.post('/card/lock', (req, res) => CardController.lockCard(req, res));


// Export the router
export default router;