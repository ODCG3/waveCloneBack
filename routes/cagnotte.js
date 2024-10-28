import express from 'express';
import CagnotteController from '../controllers/CagnotteController.js';  // Ajoutez .js ici
var router = express.Router();

router.post('/create', CagnotteController.create);
router.post('/:cagnotteId/contribute', CagnotteController   .contribute);
router.get('/', CagnotteController.getAllCagnottes);
router.get('/:id', CagnotteController.getCagnotteById);

export default router;
