import ResponseFormatter from '../utils/ResponseFormatter.js';
import InvitationRepository from '../Database/repositories/InvitationRepository.js';
import Repository from '../Database/Repository.js'; // Importation ajoutée
import { sendEmail, sendSMS } from '../utils/NotificationService.js'; // Assurez-vous que ce fichier existe

class InvitationController {
    static repository = new Repository("invitation");

    static async create(req, res) {
        try {
            // Vérifiez que req.user est défini
            if (!req.user || !req.user.id) {
                return res.status(401).json(ResponseFormatter.formatResponse(null, 'Utilisateur non authentifié', 401));
            }

            console.log("Données de la requête:", req.body); // Log des données reçues
            const invitationData = {
                email: req.body.email,
                phone: req.body.phone,
                code: generateInvitationCode(),
                sentAt: new Date(),
                inviterId: req.user.id // ID de l'utilisateur connecté
            };
            const invitation = await this.repository.create(invitationData);
            const message = 'Invitation envoyée avec succès';
    
            // Message personnalisé pour l'invitation
            const personalizedMessage = `Bonjour, vous êtes invité à rejoindre notre plateforme. Utilisez le code ${invitationData.code} pour vous inscrire !`;
    
            // Envoi de l'email
            await sendEmail(invitationData.email, personalizedMessage);
    
            // Envoi du SMS
            if (invitationData.phone) {
                await sendSMS(invitationData.phone, personalizedMessage);
            }
    
            res.status(201).json(ResponseFormatter.formatResponse(invitation, message, 201));
        } catch (error) {
            console.error('Erreur dans la création de l\'invitation:', error); // Log de l'erreur
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de l’envoi de l’invitation', 500));
        }
    }

    // Récupérer toutes les invitations
    static async getAll(req, res) {
        try {
            const invitations = await InvitationRepository.getAllWithUsers();
            const message = 'Liste des invitations récupérée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(invitations, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération des invitations', 500));
        }
    }

    // Récupérer une invitation par ID
    static async getById(req, res) {
        try {
            const invitation = await InvitationRepository.getByIdWithUser(req.params.id);
            if (!invitation) {
                return res.status(404).json(ResponseFormatter.formatResponse(null, 'Invitation non trouvée', 404));
            }
            const message = 'Invitation récupérée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(invitation, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération de l’invitation', 500));
        }
    }

    // Mettre à jour une invitation
    static async update(req, res) {
        try {
            const invitation = await InvitationRepository.update(req.params.id, req.body);
            const message = 'Invitation mise à jour avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(invitation, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la mise à jour de l’invitation', 500));
        }
    }

    // Supprimer une invitation
    static async delete(req, res) {
        try {
            await InvitationRepository.delete(req.params.id);
            const message = 'Invitation supprimée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(null, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la suppression de l’invitation', 500));
        }
    }
}

// Génère un code d'invitation unique
function generateInvitationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

export default InvitationController;
