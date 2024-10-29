// routes/poche.js
import express from 'express';
import PocheController from '../controllers/PocheController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Création d'une nouvelle poche
//router.post('/create', PocheController.createPoche);

// Effectuer un transfert depuis une poche
//router.post('/transfer', PocheController.transferFromPoche);

// Mettre à jour une poche (date limite ou montant)
//router.patch('/:poche_id', PocheController.updatePoche);

// Récupérer toutes les poches de l'utilisateur
router.get('/', PocheController.getAllPoches);



router.route('/create')
  .post(auth, (req, res) => PocheController.createPoche(req, res));


router.route('/:poche_id')
  .post(auth, (req, res) => PocheController.updatePoche(req, res));

router.route('/transfer')
  .post(auth, (req, res) => PocheController.transferFromPoche(req, res));


router.route('/')
  .post(auth, (req, res) => PocheController.getAllPoches(req, res));
export default router;