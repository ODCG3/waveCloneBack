// controllers/PocheController.js
import instance from "../utils/ResponseFormatter.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class PocheController {
    // Types de poches disponibles
    static TYPES_POCHE = {
        EPARGNE: 'EPARGNE',        // Poche d'épargne classique
        PROJET: 'PROJET',          // Poche projet avec objectif
        BLOCAGE: 'BLOCAGE',        // Poche bloquée jusqu'à une date
        URGENCE: 'URGENCE'         // Poche pour les urgences
    };

    static async createPoche(req, res) {
        try {
            const { montant, type, date_limite, nom } = req.body;
            const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

            // Validation du type de poche
            if (!Object.values(PocheController.TYPES_POCHE).includes(type)) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "Type de poche invalide",
                        400,
                        "INVALID_POCHE_TYPE"
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
                        "INSUFFICIENT_BALANCE"
                    )
                );
            }

            // Créer la poche
            const nouvellePoche = await prisma.$transaction(async (prisma) => {
                // Créer la poche
                const poche = await prisma.poche.create({
                    data: {
                        users_id,
                        montant: parseFloat(montant),
                        type,
                        date_limite: date_limite ? new Date(date_limite) : null,
                        users_poche: {
                            create: {
                                users_id
                            }
                        }
                    }
                });

                // Mettre à jour le solde de l'utilisateur
                await prisma.users.update({
                    where: { id: users_id },
                    data: {
                        solde: {
                            decrement: parseFloat(montant)
                        }
                    }
                });

                return poche;
            });

            return res.status(201).json(
                instance.formatResponse(
                    nouvellePoche,
                    "Poche créée avec succès",
                    201,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la création de la poche",
                    500,
                    error.message
                )
            );
        }
    }

    static async transferFromPoche(req, res) {
        try {
            const { montant, destinataire_id, poche_id } = req.body;
            const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

            // Vérifier la poche
            const poche = await prisma.poche.findUnique({
                where: { 
                    id: parseInt(poche_id),
                    users_id
                }
            });

            if (!poche) {
                return res.status(404).json(
                    instance.formatResponse(
                        null,
                        "Poche non trouvée",
                        404,
                        "POCHE_NOT_FOUND"
                    )
                );
            }

            // Vérifications selon le type de poche
            if (poche.type === PocheController.TYPES_POCHE.BLOCAGE) {
                if (poche.date_limite && new Date() < new Date(poche.date_limite)) {
                    return res.status(400).json(
                        instance.formatResponse(
                            null,
                            "Cette poche est bloquée jusqu'au " + poche.date_limite,
                            400,
                            "POCHE_LOCKED"
                        )
                    );
                }
            }

            // Vérifier le montant disponible
            if (poche.montant < montant) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "Montant insuffisant dans la poche",
                        400,
                        "INSUFFICIENT_POCHE_BALANCE"
                    )
                );
            }

            // Effectuer le transfert
            const transaction = await prisma.$transaction(async (prisma) => {
                // Mettre à jour la poche
                const pocheUpdated = await prisma.poche.update({
                    where: { id: poche_id },
                    data: {
                        montant: {
                            decrement: parseFloat(montant)
                        }
                    }
                });

                // Mettre à jour le solde du destinataire
                const destinataireUpdated = await prisma.users.update({
                    where: { id: parseInt(destinataire_id) },
                    data: {
                        solde: {
                            increment: parseFloat(montant)
                        }
                    }
                });

                // Créer la transaction
                const newTransaction = await prisma.transaction.create({
                    data: {
                        montant: parseFloat(montant),
                        destinataire: parseInt(destinataire_id),
                        exp: users_id,
                        type: {
                            connectOrCreate: {
                                where: { libelle: 'TRANSFER_POCHE' },
                                create: { libelle: 'TRANSFER_POCHE' }
                            }
                        },
                        users_transaction: {
                            create: {
                                users_id,
                                role: 'EXPEDITEUR'
                            }
                        }
                    }
                });

                return { pocheUpdated, destinataireUpdated, newTransaction };
            });

            return res.status(200).json(
                instance.formatResponse(
                    transaction,
                    "Transfert effectué avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors du transfert",
                    500,
                    error.message
                )
            );
        }
    }

    static async updatePoche(req, res) {
        try {
            const { poche_id } = req.params;
            const { nouvelle_date_limite, nouveau_montant } = req.body;
            const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

            const poche = await prisma.poche.findUnique({
                where: { 
                    id: parseInt(poche_id),
                    users_id
                }
            });

            if (!poche) {
                return res.status(404).json(
                    instance.formatResponse(
                        null,
                        "Poche non trouvée",
                        404,
                        "POCHE_NOT_FOUND"
                    )
                );
            }

            // Si on veut augmenter le montant, vérifier le solde de l'utilisateur
            if (nouveau_montant && nouveau_montant > poche.montant) {
                const user = await prisma.users.findUnique({
                    where: { id: users_id }
                });

                const difference = nouveau_montant - poche.montant;
                if (user.solde < difference) {
                    return res.status(400).json(
                        instance.formatResponse(
                            null,
                            "Solde insuffisant pour augmenter le montant de la poche",
                            400,
                            "INSUFFICIENT_BALANCE"
                        )
                    );
                }
            }

            const updateData = {};
            if (nouvelle_date_limite) updateData.date_limite = new Date(nouvelle_date_limite);
            if (nouveau_montant) updateData.montant = parseFloat(nouveau_montant);

            const pocheUpdated = await prisma.poche.update({
                where: { id: parseInt(poche_id) },
                data: updateData
            });

            return res.status(200).json(
                instance.formatResponse(
                    pocheUpdated,
                    "Poche mise à jour avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la mise à jour de la poche",
                    500,
                    error.message
                )
            );
        }
    }

    static async getAllPoches(req, res) {
        try {
            const users_id = 1; // À remplacer par l'ID de l'utilisateur authentifié

            const poches = await prisma.poche.findMany({
                where: { users_id },
                include: {
                    users_poche: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            return res.status(200).json(
                instance.formatResponse(
                    poches,
                    "Poches récupérées avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération des poches",
                    500,
                    error.message
                )
            );
        }
    }
}

export default PocheController;