// src/Database/repositories/NotificationsRepository.js
import Repository from '../Repository.js'; // Assurez-vous que le chemin est correct

class NotificationsRepository extends Repository {
    constructor() {
        super('notification'); // Appelle le constructeur de la classe parent avec le modèle 'notification'
    }

    // Créer une notification
    async createNotification({ usersId, message, etat }) {
        return await this.create({
            users_id: usersId,
            message,
            etat,
        });
    }

    // Récupérer toutes les notifications d'un utilisateur
    async getUserNotifications(usersId) {
        return await this.prisma.notification.findMany({
            where: { users_id: usersId },
            include: { users_notification: true },
            orderBy: { id: 'desc' },
        });
    }

    // Récupérer uniquement les notifications non lues d'un utilisateur
    async getUnreadNotifications(usersId) {
        return await this.prisma.notification.findMany({
            where: {
                users_id: usersId,
                etat: false, // Filtre pour les notifications non lues
            },
            orderBy: { id: 'desc' },
        });
    }

    // Mettre à jour l'état d'une notification
    async updateNotificationStatus(notificationId, etat) {
        return await this.update(notificationId, { etat }); // Utilise la méthode update de la classe parent
    }

}

export default NotificationsRepository;