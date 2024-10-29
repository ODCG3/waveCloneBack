import instance from "../utils/ResponseFormatter.js";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

class CagnotteController {
    // Fonction utilitaire pour masquer les informations sensibles
    static sanitizeUserData(user, isOwner = false) {
        if (!user) return null;
        
        // Si c'est le propriétaire, on renvoie toutes les informations
        if (isOwner) {
            return {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: user.telephone,
                solde: user.solde
            };
        }
        
        // Sinon, on ne renvoie que les informations publiques
        return {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom
        };
    }

    // Fonction utilitaire pour masquer les informations de la cagnotte
    static sanitizeCagnotteData(cagnotte, userId) {
        if (!cagnotte) return null;

        const isOwner = cagnotte.users_id === userId;
        
        return {
            id: cagnotte.id,
            montant: isOwner ? cagnotte.montant : "***",
            montant_objectif: cagnotte.montant_objectif,
            users_cagnotte: cagnotte.users_cagnotte.map(uc => ({
                users_id: uc.users_id,
                cagnotte_id: uc.cagnotte_id,
                users: this.sanitizeUserData(uc.users, uc.users_id === userId)
            }))
        };
    }

    static async create(req, res) {
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

            const { montant_objectif } = req.body;

            if (!montant_objectif || montant_objectif <= 0) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "Le montant objectif doit être supérieur à 0",
                        400,
                        "VALIDATION_ERROR"
                    )
                );
            }

            const nouvelleCagnotte = await prisma.cagnotte.create({
                data: {
                    users_id: users_id,
                    montant: 0,
                    montant_objectif: parseFloat(montant_objectif),
                    users_cagnotte: {
                        create: {
                            users_id: users_id
                        }
                    }
                },
                include: {
                    users_cagnotte: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            return res.status(201).json(
                instance.formatResponse(
                    this.sanitizeCagnotteData(nouvelleCagnotte, users_id),
                    "Cagnotte créée avec succès",
                    201,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la création de la cagnotte",
                    500,
                    error.message
                )
            );
        }
    }

    static async contribute(req, res) {
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

            const { montant } = req.body;
            const { cagnotteId } = req.params;

            if (!montant || montant <= 0) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "Le montant de la contribution doit être supérieur à 0",
                        400,
                        "VALIDATION_ERROR"
                    )
                );
            }

            const cagnotte = await prisma.cagnotte.findUnique({
                where: { id: parseInt(cagnotteId) }
            });

            if (!cagnotte) {
                return res.status(404).json(
                    instance.formatResponse(
                        null,
                        "Cagnotte non trouvée",
                        404,
                        "NOT_FOUND"
                    )
                );
            }

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

            const updatedCagnotte = await prisma.cagnotte.update({
                where: { id: parseInt(cagnotteId) },
                data: {
                    montant: {
                        increment: parseFloat(montant)
                    },
                    users_cagnotte: {
                        create: {
                            users_id: users_id
                        }
                    }
                },
                include: {
                    users_cagnotte: {
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

            await prisma.transaction.create({
                data: {
                    montant: parseFloat(montant),
                    users_transaction_expTousers: {
                        connect: {
                            id: users_id
                        }
                    },
                    type: {
                        connectOrCreate: {
                            where: { libelle: 'CONTRIBUTION_CAGNOTTE' },
                            create: { libelle: 'CONTRIBUTION_CAGNOTTE' }
                        }
                    },
                    users_transaction: {
                        create: {
                            users_id: users_id,
                            role: 'CONTRIBUTEUR'
                        }
                    }
                }
            });

            return res.status(200).json(
                instance.formatResponse(
                    this.sanitizeCagnotteData(updatedCagnotte, users_id),
                    "Contribution effectuée avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la contribution",
                    500,
                    error.message
                )
            );
        }
    }

    static async getAllCagnottes(req, res) {
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

            const cagnottes = await prisma.cagnotte.findMany({
                include: {
                    users_cagnotte: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            const sanitizedCagnottes = cagnottes.map(cagnotte => 
                this.sanitizeCagnotteData(cagnotte, users_id)
            );

            return res.status(200).json(
                instance.formatResponse(
                    sanitizedCagnottes,
                    "Cagnottes récupérées avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération des cagnottes",
                    500,
                    error.message
                )
            );
        }
    }

    static async getCagnotteById(req, res) {
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

            const { id } = req.params;
            const cagnotte = await prisma.cagnotte.findUnique({
                where: { id: parseInt(id) },
                include: {
                    users_cagnotte: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            if (!cagnotte) {
                return res.status(404).json(
                    instance.formatResponse(
                        null,
                        "Cagnotte non trouvée",
                        404,
                        "NOT_FOUND"
                    )
                );
            }

            return res.status(200).json(
                instance.formatResponse(
                    this.sanitizeCagnotteData(cagnotte, users_id),
                    "Cagnotte récupérée avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération de la cagnotte",
                    500,
                    error.message
                )
            );
        }
    }
}

export default CagnotteController;