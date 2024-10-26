// src/controllers/PromoController.js
import ResponseFormatter from '../utils/ResponseFormatter.js';
import PromoRepository from '../Database/repositories/PromoRepository.js';

class PromoController {
    // Créer une promotion
    static async create(req, res) {
        try {
            const promoData = req.body;
            const promo = await PromoRepository.create(promoData);
            const message = 'Promotion créée avec succès';
            res.status(201).json(ResponseFormatter.formatResponse(promo, message, 201));
        } catch (error) {
            console.error('Erreur lors de la création de la promotion:', error);
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la création de la promotion', 500));
        }
    }

    // Récupérer toutes les promotions
    static async getAll(req, res) {
        try {
            const promotions = await PromoRepository.getAll();
            const message = 'Liste des promotions récupérée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(promotions, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération des promotions', 500));
        }
    }

    // Récupérer une promotion par ID
    static async getById(req, res) {
        try {
            const promo = await PromoRepository.getById(req.params.id);
            if (!promo) {
                return res.status(404).json(ResponseFormatter.formatResponse(null, 'Promotion non trouvée', 404));
            }
            const message = 'Promotion récupérée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(promo, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la récupération de la promotion', 500));
        }
    }

    // Mettre à jour une promotion
    static async update(req, res) {
        try {
            const promo = await PromoRepository.update(req.params.id, req.body);
            const message = 'Promotion mise à jour avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(promo, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la mise à jour de la promotion', 500));
        }
    }

    // Supprimer une promotion
    static async delete(req, res) {
        try {
            await PromoRepository.delete(req.params.id);
            const message = 'Promotion supprimée avec succès';
            res.status(200).json(ResponseFormatter.formatResponse(null, message));
        } catch (error) {
            res.status(500).json(ResponseFormatter.formatResponse(null, 'Erreur lors de la suppression de la promotion', 500));
        }
    }
}

export default PromoController;
