// controllers/CagnotteController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



class CagnotteController {
    static repository = new Repository("cagnotte");

    static async create(req, res) {
        try {
            const { montant_objectif } = req.body;
            const users_id = 1; // ID fixe pour le moment

            // Validation
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

            // Créer la cagnotte
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
                    users_cagnotte: true
                }
            });

            return res.status(201).json(
                instance.formatResponse(
                    nouvelleCagnotte,
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
            const { montant } = req.body;
            const { cagnotteId } = req.params;
            const users_id = 1; // ID fixe pour le moment

            // Validation
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

            // Vérifier si la cagnotte existe
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

            // Mettre à jour le montant de la cagnotte
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
                    users_cagnotte: true
                }
            });

            // Créer une transaction pour la contribution
            await prisma.transaction.create({
                data: {
                    montant: parseFloat(montant),
                    exp: users_id,
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
                    updatedCagnotte,
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
            const cagnottes = await prisma.cagnotte.findMany({
                include: {
                    users_cagnotte: {
                        include: {
                            users: true
                        }
                    }
                }
            });

            return res.status(200).json(
                instance.formatResponse(
                    cagnottes,
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
                    cagnotte,
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