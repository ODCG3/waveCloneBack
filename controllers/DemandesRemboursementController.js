// src/controllers/DemandesRemboursementController.js
import ResponseFormatter from '../utils/ResponseFormatter.js';
import DemandesRemboursementRepository from '../Database/repositories/DemandesRemboursementRepository.js';
import NotificationsController from './NotificationsController.js'; // Import du controller pour les notifications

class DemandesRemboursementController {
    // Créer une demande de remboursement
    static async createRequest(req, res) {
        try {
            const { users_id, montant, motif } = req.body;
    
            // Crée la demande de remboursement
            const demande = await DemandesRemboursementRepository.create({
                users_id,
                montant,
                motif,
                status: 'Pending',
            });
    
            // Créer une notification après la création de la demande
            await NotificationsController.createNotification({
                body: { usersId: users_id, message: `Votre demande de remboursement de ${montant} a été créée avec succès.`, etat: false }
            });
    
            // Envoyer une seule réponse ici
            res.status(201).json(ResponseFormatter.formatResponse(demande, 'Demande de remboursement créée avec succès', 201));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la création de la demande de remboursement', 500));
        }
    }    

    // Approuver une demande de remboursement
    static async approveRequest(req, res) {
        try {
            const { id } = req.params;
            const demandeId = parseInt(id, 10);
            const demande = await DemandesRemboursementRepository.getById(demandeId);

            if (!demande || demande.status !== 'Pending') {
                return res.status(400).json(ResponseFormatter.formatResponse(null, 'Demande non valide ou déjà traitée', 400));
            }

            const updatedDemande = await DemandesRemboursementRepository.update(demandeId, { status: 'Approved' });
            const user = await DemandesRemboursementRepository.getUserById(demande.users_id);

            if (!user) {
                return res.status(404).json(ResponseFormatter.formatResponse(null, 'Utilisateur non trouvé', 404));
            }

            const nouveauSolde = user.solde - demande.montant;
            await DemandesRemboursementRepository.updateUser(user.id, { solde: nouveauSolde });

            // Créer une notification après l'approbation de la demande
            await NotificationsController.createNotification(
                { body: { usersId: demande.users_id, message: `Votre demande de remboursement de ${demande.montant} a été approuvée.`, etat: 'Non lu' } },
                res
            );

            res.status(200).json(ResponseFormatter.formatResponse(updatedDemande, 'Demande de remboursement approuvée avec succès', 200));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de l’approbation de la demande de remboursement', 500));
        }
    }

    // Récupérer toutes les demandes de remboursement
    static async getAllRequests(req, res) {
        try {
            const demandes = await DemandesRemboursementRepository.getAll();
            res.status(200).json(ResponseFormatter.formatResponse(demandes, 'Liste des demandes de remboursement', 200));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération des demandes de remboursement', 500));
        }
    }

    // Récupérer une demande de remboursement par ID
    static async getRequestById(req, res) {
        try {
            const { id } = req.params;
            const demande = await DemandesRemboursementRepository.getById(id);
            if (!demande) {
                return res.status(404).json(ResponseFormatter.formatResponse(null, 'Demande non trouvée', 404));
            }
            res.status(200).json(ResponseFormatter.formatResponse(demande, 'Détails de la demande de remboursement', 200));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération de la demande', 500));
        }
    }
}

export default DemandesRemboursementController;
