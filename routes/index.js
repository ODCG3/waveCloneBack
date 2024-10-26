import express from 'express';
import UserController from '../controllers/UserController.js';
import InvitationController from '../controllers/InvitationController.js';
import TestNotificationController from '../controllers/TestNotificationController.js';


const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// // Endpoint routes Invitation 
// router.post('/invitations', InvitationController.create);
// router.get('/invitations', InvitationController.getAll);
// router.get('/invitations/:id', InvitationController.getById);
// router.delete('/invitations/:id', InvitationController.delete);

// test 
router.post('/test-notifications', TestNotificationController.testNotifications);

// Example endpoint
router.get('/example', (req,res) => UserController.getAll(req,res));

// Export the router
export default router;