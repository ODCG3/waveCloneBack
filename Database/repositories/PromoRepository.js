// src/repositories/PromoRepository.js
import Repository from '../Repository.js'; // Assurez-vous d'importer le bon chemin

class PromoRepository extends Repository {
    constructor() {
        super('promo'); // Appeler le constructeur de Repository avec le modèle 'promo'
    }

    // Créer une promotion
    async create(data) {
        return this.prisma.promo.create({
            data,
        });
    }

    // Récupérer toutes les promotions
    async getAll() {
        return this.prisma.promo.findMany();
    }

    // Récupérer une promotion par ID
    async getById(id) {
        return this.prisma.promo.findUnique({
            where: { id },
        });
    }

    // Mettre à jour une promotion
    async update(id, data) {
        return this.prisma.promo.update({
            where: { id },
            data,
        });
    }

    // Supprimer une promotion
    async delete(id) {
        return this.prisma.promo.delete({
            where: { id },
        });
    }
}

export default new PromoRepository();
