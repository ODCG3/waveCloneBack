// src/repositories/InvitationRepository.js
import Repository from '../Repository.js'; // Importer le repository général

class InvitationRepository extends Repository {
    constructor() {
        super('invitation'); // Appeler le constructeur de Repository avec le modèle 'invitation'
    }

    // Créer une invitation
    async create(data) {
        return this.prisma.invitation.create({
            data,
            include: { users: true }, // Inclut les informations de l'utilisateur
        });
    }

    // Récupérer toutes les invitations avec les informations des utilisateurs
    async getAllWithUsers() {
        return this.prisma.invitation.findMany({
            include: { users: true },
        });
    }

    // Récupérer une invitation par ID avec les informations de l'utilisateur
    async getByIdWithUser(id) {
        return this.prisma.invitation.findUnique({
            where: { id },
            include: { users: true },
        });
    }

    // Supprimer une invitation
    async delete(id) {
        return this.prisma.invitation.delete({ where: { id } });
    }
}

export default new InvitationRepository();
