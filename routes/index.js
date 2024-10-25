import express from 'express';
import UserController from '../controllers/UserController.js';
import auth from '../middleware/auth.js';
import TransactionController from '../controllers/TransactionController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.route('/user/create')
.post(auth,(req,res) => UserController.create(req,res));

router.route('/login')
.post((req,res)=> UserController.login(req,res));

router.route('/logout')
.post((req,res)=> UserController.logout(req,res));

router.route('/reinitializeCode')
.post(auth,(req,res)=> UserController.reinitializeCode(req,res));

router.route('/transferer')
.post(auth,(req,res)=> TransactionController.transfert(req,res));

// Example endpoint
router.get('/users', (req,res) => UserController.getAll(req,res));

// Export the router
export default router;