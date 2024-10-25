import express from 'express';
import UserController from '../controllers/UserController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/user/create',(req,res) => UserController.create(req,res));

// Example endpoint
router.get('/users', (req,res) => UserController.getAll(req,res));

// Export the router
export default router;