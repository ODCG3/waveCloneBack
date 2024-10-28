// src/controllers/NotificationsController.js
import ResponseFormatter from '../utils/ResponseFormatter.js';
import NotificationsRepository from '../Database/repositories/NotificationsRepository.js';

const notificationsRepository = new NotificationsRepository();

class NotificationsController {
    // Créer une nouvelle notification
    static async createNotification(req) {
        const { usersId, message, etat } = req.body;

        try {
            const notification = await notificationsRepository.createNotification({ usersId, message, etat });
            return notification; // Retourne la notification sans envoyer de réponse
        } catch (error) {
            console.error(error);
            throw new Error("Erreur lors de la création de la notification");
        }
    }

    // Récupérer toutes les notifications d'un utilisateur
    static async getUserNotifications(req, res) {
        const { usersId } = req.params;

        try {
            const notifications = await notificationsRepository.getUserNotifications(parseInt(usersId, 10));
            res.status(200).json(ResponseFormatter.formatResponse(notifications, 'Liste des notifications', 200));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération des notifications', 500));
        }
    }

    // Mettre à jour l'état d'une notification
    static async updateNotificationStatus(req, res) {
        const { notificationId } = req.params;
        const { etat } = req.body;

        try {
            const updatedNotification = await notificationsRepository.updateNotificationStatus(parseInt(notificationId, 10), etat);
            res.status(200).json(ResponseFormatter.formatResponse(updatedNotification, 'État de la notification mis à jour', 200));
        } catch (error) {
            console.error(error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la mise à jour de la notification', 500));
        }
    }
}

export default NotificationsController;
