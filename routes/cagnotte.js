import express from 'express';
import CagnotteController from '../controllers/CagnotteController.js';  // Ajoutez .js ici
import auth from '../middleware/auth.js';
var router = express.Router();

//router.post('/create', CagnotteController.create);


//router.post('/:cagnotteId/contribute', CagnotteController.contribute);


//router.get('/', CagnotteController.getAllCagnottes);
//router.get('/:id', CagnotteController.getCagnotteById);



router.route('/create')
.post(auth, (req, res) => CagnotteController.create(req, res));


router.route('/:cagnotteId/contribute')
  .post(auth, (req, res) => CagnotteController.contribute(req, res));


router.route('/')
  .get(auth, (req, res) => CagnotteController.getAllCagnottes(req, res));


router.route('/:id')
  .get(auth, (req, res) => CagnotteController.getCagnotteById(req, res));
export default router;
