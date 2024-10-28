import express from 'express';
import UserController from '../controllers/UserController.js';
import InvitationController from '../controllers/InvitationController.js';
import TestNotificationController from '../controllers/TestNotificationController.js';
import DemandesRemboursementController from '../controllers/DemandesRemboursementController.js';
import NotificationsController from '../controllers/NotificationsController.js';
import PromoController from '../controllers/PromoController.js';
import PaymentController from '../controllers/PaymentController.js';
import BillPaymentController from '../controllers/BillPaymentController.js';
import MerchantPaymentController from '../controllers/MerchantPaymentController.js';
import CardController from '../controllers/CardController.js';
import GestionCadeau from '../controllers/GestionCadeau.js';
import ClassementController from '../controllers/ClassementController.js';
import auth from '../middleware/auth.js';
import TransactionController from '../controllers/TransactionController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Endpoint routes Invitation 
router.post('/invitations', InvitationController.create);
router.get('/invitations', InvitationController.getAll);
router.get('/invitations/:id', InvitationController.getById);
router.delete('/invitations/:id', InvitationController.delete);

// Routes pour les DemandesRemboursement
router.post('/demandes', DemandesRemboursementController.createRequest);
router.put('/demandes/:id/approuver', DemandesRemboursementController.approveRequest);
router.get('/demandes', DemandesRemboursementController.getAllRequests);
router.get('/demandes/:id', DemandesRemboursementController.getRequestById);

// Routes pour les promotions
router.post('/promos', PromoController.create); // Créer une promotion
router.get('/promos', PromoController.getAll); // Récupérer toutes les promotions
router.get('/promos/:id', PromoController.getById); // Récupérer une promotion par ID
router.put('/promos/:id', PromoController.update); // Mettre à jour une promotion
router.delete('/promos/:id', PromoController.delete); // Supprimer une promotion


// Route pour créer une notification
router.post('/', NotificationsController.createNotification);
// Route pour récupérer toutes les notifications d'un utilisateur
router.get('/:usersId', NotificationsController.getUserNotifications);
// Route pour mettre à jour l'état d'une notification
router.put('/:notificationId', NotificationsController.updateNotificationStatus);

// test 
router.post('/test-notifications', TestNotificationController.testNotifications);

// Endpoint routes Invitation 
router.post('/invitations', InvitationController.create);
router.get('/invitations', InvitationController.getAll);
router.get('/invitations/:id', InvitationController.getById);
router.delete('/invitations/:id', InvitationController.delete);

// Routes pour les DemandesRemboursement
router.post('/demandes', DemandesRemboursementController.createRequest);
router.put('/demandes/:id/approuver', DemandesRemboursementController.approveRequest);
router.get('/demandes', DemandesRemboursementController.getAllRequests);
router.get('/demandes/:id', DemandesRemboursementController.getRequestById);

// Routes pour les promotions
router.post('/promos', PromoController.create); // Créer une promotion
router.get('/promos', PromoController.getAll); // Récupérer toutes les promotions
router.get('/promos/:id', PromoController.getById); // Récupérer une promotion par ID
router.put('/promos/:id', PromoController.update); // Mettre à jour une promotion
router.delete('/promos/:id', PromoController.delete); // Supprimer une promotion


// Route pour créer une notification
router.post('/', NotificationsController.createNotification);
// Route pour récupérer toutes les notifications d'un utilisateur
router.get('/:usersId', NotificationsController.getUserNotifications);
// Route pour mettre à jour l'état d'une notification
router.put('/:notificationId', NotificationsController.updateNotificationStatus);

// test 
router.post('/test-notifications', TestNotificationController.testNotifications);

router.route('/depot')
  .post(auth, (req, res) => TransactionController.depot(req, res));

router.route('/retrait')
  .post(auth, (req, res) => TransactionController.retrait(req, res));

router.route('/user/create')
  .post((req, res) => UserController.create(req, res));

router.route('/login')
  .post((req, res) => UserController.login(req, res));

router.route('/logout')
  .post((req, res) => UserController.logout(req, res));

router.route('/reinitializeCode')
  .post(auth, (req, res) => UserController.reinitializeCode(req, res));

router.route('/transferer')
  .post(auth, (req, res) => TransactionController.transfert(req, res));

// Example endpoint
router.get("/example", (req, res) => UserController.getAll(req, res));



// Endpoint pour effectuer un paiement marchand
router.route('/merchant-payment').post(auth, (req, res) => MerchantPaymentController.payMerchant(req, res));


//endpoint pour le paiement d'un facture 
router.route('/bill-payment').post(auth, (req, res) => BillPaymentController.payBill(req, res));


//endpoint pour verouiller la carte en cas de perte
router.route('/card/lock').post(auth, (req, res) => CardController.lockCard(req, res));
router.get('/users', (req, res) => UserController.getAll(req, res));

router.route('/cadeau/assigner').post(auth, (req, res) => GestionCadeau.assignCadeau(req, res));

 
//endpoint qui permet de lister les user par rang selon de nombre de trensactions faites 
router.route('/user/ranking').get(auth, (req, res) => ClassementController.getRanking(req, res));

router.route('/payment/bulk').post(auth, (req, res) => PaymentController.makeBulkPayment(req, res));

router.route('/users/reportIssue')
.post(auth, (req, res) => UserController.reportIssue(req, res));

router.route('/admin/respondIssue')
.post(auth, (req, res) => UserController.respondToIssueInApp(req, res));

router.get('/users', (req, res) => UserController.getAll(req, res));


router.get('/example', (req,res) => UserController.getAll(req,res));

// Endpoint pour effectuer un paiement marchand
router.post('/merchant-payment', (req, res) => MerchantPaymentController.payMerchant(req, res));


//endpoint pour le paiement d'un facture 
router.post('/bill-payment', (req, res) => BillPaymentController.payBill(req, res));


//endpoint pour verouiller la carte en cas de perte
router.post('/card/lock', (req, res) => CardController.lockCard(req, res));

router.route('/user/stats')
  .get(auth, (req, res) => UserController.getStatistiques(req, res));

router.route('/user/link-bank')
  .post(auth, (req, res) => UserController.linkToBankAccount(req, res));

router.route('/user/bank-account')
  .get(auth, (req, res) => UserController.getBankAccount(req, res));

// Export the router
export default router;
