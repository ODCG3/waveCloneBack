// controllers/CreditController.js
import { PrismaClient } from '@prisma/client';
import instance from "../utils/ResponseFormatter.js";
import SmsService from '../services/SmsService.js';
import CreditService from '../services/CreditService.js';

const prisma = new PrismaClient();

class CreditController {
    // Dans CreditController.js
// Dans CreditController.js
static async achatCredit(req, res) {
    try {
        const { telephone, montant, operateur } = req.body;
        const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

        // Validation
        if (!telephone || !montant || !operateur) {
            return res.status(400).json(
                instance.formatResponse(
                    null,
                    "Tous les champs sont requis",
                    400,
                    "VALIDATION_ERROR"
                )
            );
        }

        // Vérifier le solde de l'utilisateur
        const user = await prisma.users.findUnique({
            where: { id: users_id }
        });

        if (!user || user.solde < montant) {
            return res.status(400).json(
                instance.formatResponse(
                    null,
                    "Solde insuffisant",
                    400,
                    "INSUFFICIENT_FUNDS"
                )
            );
        }

        // Trouver ou créer le type
        let type = await prisma.type.findFirst({
            where: { libelle: 'ACHAT_CREDIT' }
        });

        if (!type) {
            type = await prisma.type.create({
                data: { libelle: 'ACHAT_CREDIT' }
            });
        }

        // Créer la transaction
        const transaction = await prisma.transaction.create({
            data: {
                montant: parseFloat(montant),
                users_transaction_expTousers: {
                    connect: {
                        id: users_id
                    }
                },
                type: {
                    connect: {
                        id: type.id
                    }
                },
                users_transaction: {
                    create: {
                        users_id: users_id,
                        role: 'ACHETEUR'
                    }
                }
            },
            include: {
                type: true,
                users_transaction: true,
                users_transaction_expTousers: true
            }
        });

        // Mettre à jour le solde
        const updatedUser = await prisma.users.update({
            where: { id: users_id },
            data: {
                solde: {
                    decrement: montant
                }
            }
        });

        // Formater le numéro de téléphone pour le SMS
        const formattedPhone = telephone.startsWith('+') ? telephone : `+225${telephone}`;
        const message = `Votre recharge de ${montant} FCFA a été effectuée avec succès.\nNouveau solde: ${updatedUser.solde} FCFA`;
        
        await SmsService.envoyerSMS(formattedPhone, message);

        return res.status(200).json(
            instance.formatResponse(
                {
                    transaction,
                    nouveauSolde: updatedUser.solde
                },
                "Achat de crédit effectué avec succès",
                200,
                null
            )
        );

    } catch (error) {
        console.error(error);
        return res.status(500).json(
            instance.formatResponse(
                null,
                "Erreur lors de l'achat de crédit",
                500,
                error.message
            )
        );
    }
}

    static async getHistorique(req, res) {
        try {
            const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

            const transactions = await prisma.transaction.findMany({
                where: {
                    exp: users_id,
                    type: {
                        libelle: 'ACHAT_CREDIT'
                    }
                },
                include: {
                    type: true,
                    users_transaction: true
                },
                orderBy: {
                    id: 'desc'
                }
            });

            return res.status(200).json(
                instance.formatResponse(
                    transactions,
                    "Historique récupéré avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération de l'historique",
                    500,
                    error.message
                )
            );
        }
    }

    static async getAchatById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await prisma.transaction.findUnique({
                where: { 
                    id: parseInt(id)
                },
                include: {
                    type: true,
                    users_transaction: true
                }
            });

            if (!transaction) {
                return res.status(404).json(
                    instance.formatResponse(
                        null,
                        "Transaction non trouvée",
                        404,
                        "NOT_FOUND"
                    )
                );
            }

            return res.status(200).json(
                instance.formatResponse(
                    transaction,
                    "Transaction récupérée avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération de la transaction",
                    500,
                    error.message
                )
            );
        }
    }
}

export default CreditController;