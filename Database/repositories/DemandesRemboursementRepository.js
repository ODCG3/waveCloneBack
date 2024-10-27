// src/repositories/DemandesRemboursementRepository.js

import Repository from '../Repository.js'; // Assurez-vous d'importer le bon chemin

class DemandesRemboursementRepository extends Repository {
    constructor() {
        super('demandes_remboursement'); // Appeler le constructeur de Repository avec le modèle 'demandes_remboursement'
    }

    // Créer une demande de remboursement
    async create(data) {
        return this.prisma.demandes_remboursement.create({
            data,
        });
    }

    // Récupérer toutes les demandes de remboursement
    async getAll() {
        return this.prisma.demandes_remboursement.findMany({
            include: {
                users: true, // Inclure les détails de l'utilisateur si nécessaire
            },
        });
    }

    // Récupérer une demande de remboursement par ID
    async getById(id) {
        return this.prisma.demandes_remboursement.findUnique({
            where: { id },
            include: {
                users: true, // Inclure les détails de l'utilisateur si nécessaire
            },
        });
    }

    // Mettre à jour une demande de remboursement
    async update(id, data) {
        return this.prisma.demandes_remboursement.update({
            where: { id },
            data,
        });
    }

    // Supprimer une demande de remboursement
    async delete(id) {
        return this.prisma.demandes_remboursement.delete({
            where: { id },
        });
    }

    // Récupérer un utilisateur par ID
    async getUserById(id) {
        return this.prisma.users.findUnique({
            where: { id },
        });
    }

    // Mettre à jour un utilisateur
    async updateUser(id, data) {
        return this.prisma.users.update({
            where: { id },
            data,
        });
    }
}

export default new DemandesRemboursementRepository();
