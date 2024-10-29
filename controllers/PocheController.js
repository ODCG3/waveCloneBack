import instance from "../utils/ResponseFormatter.js";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

class PocheController {
    // Types de poches disponibles
    static TYPES_POCHE = {
        EPARGNE: 'EPARGNE',        // Poche d'épargne classique
        PROJET: 'PROJET',          // Poche projet avec objectif
        BLOCAGE: 'BLOCAGE',        // Poche bloquée jusqu'à une date
        URGENCE: 'URGENCE'         // Poche pour les urgences
    };

    // Fonction utilitaire pour vérifier le propriétaire
    static async verifyPocheOwner(pocheId, userId) {
        const poche = await prisma.poche.findUnique({
            where: { id: parseInt(pocheId) }
        });
        return poche && poche.users_id === userId;
    }

    // Fonction utilitaire pour masquer les informations sensibles
    static sanitizePocheData(poche, userId) {
        if (!poche) return null;
        
        const isOwner = poche.users_id === userId;
        
        if (!isOwner) {
            return null; // On ne renvoie rien si ce n'est pas le propriétaire
        }

        return {
            id: poche.id,
            montant: poche.montant,
            type: poche.type,
            date_limite: poche.date_limite,
            users_poche: poche.users_poche?.map(up => ({
                users_id: up.users_id,
                users: {
                    id: up.users.id,
                    nom: up.users.nom,
                    prenom: up.users.prenom
                }
            }))
        };
    }

    static async createPoche(req, res) {
        try {
            const token = req.cookies.token;
            
            if (!token) {
                return res.status(401).json(
                    instance.formatResponse(
                        null,
                        "Authentification requise",
                        401,
                        "AUTH_ERROR"
                    )
                );
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users_id = decoded.userId;

            const { montant, type, date_limite, nom } = req.body;

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
                    },
                    include: {
                        users_poche: {
                            include: {
                                users: true
                            }
                        }
                    }
                });

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
                    this.sanitizePocheData(nouvellePoche, users_id),
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
            const token = req.cookies.token;
            
            if (!token) {
                return res.status(401).json(
                    instance.formatResponse(
                        null,
                        "Authentification requise",
                        401,
                        "AUTH_ERROR"
                    )
                );
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users_id = decoded.userId;

            const { montant, destinataire_id, poche_id } = req.body;

            // Vérifier que l'utilisateur est propriétaire de la poche
            if (!(await this.verifyPocheOwner(poche_id, users_id))) {
                return res.status(403).json(
                    instance.formatResponse(
                        null,
                        "Accès non autorisé à cette poche",
                        403,
                        "UNAUTHORIZED_ACCESS"
                    )
                );
            }

            // Vérifier la poche
            const poche = await prisma.poche.findUnique({
                where: { id: parseInt(poche_id) }
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
                const pocheUpdated = await prisma.poche.update({
                    where: { id: poche_id },
                    data: {
                        montant: {
                            decrement: parseFloat(montant)
                        }
                    },
                    include: {
                        users_poche: {
                            include: {
                                users: true
                            }
                        }
                    }
                });

                const destinataireUpdated = await prisma.users.update({
                    where: { id: parseInt(destinataire_id) },
                    data: {
                        solde: {
                            increment: parseFloat(montant)
                        }
                    }
                });

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

                return { 
                    poche: this.sanitizePocheData(pocheUpdated, users_id),
                    transaction: newTransaction
                };
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
            const token = req.cookies.token;
            
            if (!token) {
                return res.status(401).json(
                    instance.formatResponse(
                        null,
                        "Authentification requise",
                        401,
                        "AUTH_ERROR"
                    )
                );
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users_id = decoded.userId;

            const { poche_id } = req.params;
            const { nouvelle_date_limite, nouveau_montant } = req.body;

            // Vérifier que l'utilisateur est propriétaire de la poche
            if (!(await this.verifyPocheOwner(poche_id, users_id))) {
                return res.status(403).json(
                    instance.formatResponse(
                        null,
                        "Accès non autorisé à cette poche",
                        403,
                        "UNAUTHORIZED_ACCESS"
                    )
                );
            }

            const poche = await prisma.poche.findUnique({
                where: { id: parseInt(poche_id) }
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
                data: updateData,
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
                    this.sanitizePocheData(pocheUpdated, users_id),
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
            const token = req.cookies.token;
    
            if (!token) {
                return res.status(401).json(
                    instance.formatResponse(
                        null,
                        "Authentification requise",
                        401,
                        "AUTH_ERROR"
                    )
                );
            }
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users_id = decoded.userId;
    
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
    
            // Assurez-vous que this est correct ici
            const sanitizedPoches = poches.map(poche => 
                PocheController.sanitizePocheData(poche, users_id) // Utiliser le nom de la classe ici
            );
    
            return res.status(200).json(
                instance.formatResponse(
                    sanitizedPoches,
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