import express from 'express';
import CagnotteController from '../controllers/CagnotteController.js';  // Ajoutez .js ici
import auth from '../middleware/auth.js';
const router = express.Router();


router.route('/cagnotte/create').post(auth, CagnotteController.create);
router.route('/cagnotte/:cagnotteId/contribute').post(auth, CagnotteController   .contribute);
router.route('/cagnotte').get(auth, CagnotteController.getAllCagnottes);
router.route('/cagnotte/open').get(auth, CagnotteController.getAllOpenCagnottes);
router.route('/cagnotte/:id').get(auth, CagnotteController.getCagnotteById);

export default router;
