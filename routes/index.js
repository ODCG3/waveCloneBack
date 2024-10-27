import express from 'express';
import UserController from '../controllers/UserController.js';
import InvitationController from '../controllers/InvitationController.js';
import TestNotificationController from '../controllers/TestNotificationController.js';
import DemandesRemboursementController from '../controllers/DemandesRemboursementController.js';
import NotificationsController from '../controllers/NotificationsController.js';
import PromoController from '../controllers/PromoController.js';





const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
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

// Example endpoint
router.get('/example', (req,res) => UserController.getAll(req,res));

// Export the router
export default router;