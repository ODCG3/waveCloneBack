// src/routes/invitationRoutes.js
import express from 'express';
import InvitationController from '../controllers/InvitationController.js';

const router = express.Router();

// Routes pour les invitations
router.post('/invitations', InvitationController.create); // Créer une invitation
router.get('/invitations', InvitationController.getAll); // Récupérer toutes les invitations
router.get('/invitations/:id', InvitationController.getById); // Récupérer une invitation par ID
router.put('/invitations/:id', InvitationController.update); // Mettre à jour une invitation
router.delete('/invitations/:id', InvitationController.delete); // Supprimer une invitation

export default router;
