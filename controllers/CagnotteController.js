// controllers/CagnotteController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class CagnotteController {
    static repository = new Repository("cagnotte");

    static async create(req, res) {
        try {
            const { nom, montant_objectif } = req.body;
            //const users_id = req.userId || 1; // Utilisation de l'ID de l'utilisateur authentifié si disponible
            const users_id = req.user.userId;

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
                    nom: nom,
                    users_id: users_id,
                    montant: 0,
                    montant_objectif: parseFloat(montant_objectif),
                    etat: false, // Etat par défaut à false (cagnotte ouverte)
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
            const users_id = req.user.userId;
    
            if (!cagnotteId) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "L'id de la cagnotte est obligatoire",
                        400,
                        "VALIDATION_ERROR"
                    )
                );
            }
    
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
    
            // Vérifier si la cagnotte existe et est ouverte
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
    
            if (cagnotte.etat) {
                return res.status(400).json(
                    instance.formatResponse(
                        null,
                        "La cagnotte est fermée aux contributions",
                        400,
                        "CLOSED_CAGNOTTE"
                    )
                );
            }
    
            // Créer une nouvelle transaction pour la contribution
            const transaction = await prisma.transaction.create({
                data: {
                    montant: parseFloat(montant),
                    exp: users_id,
                    type_id: 4,
                    Date: new Date()
                }
            });
    
            // Mettre à jour le montant total de la cagnotte
            const updatedCagnotte = await prisma.cagnotte.update({
                where: { id: parseInt(cagnotteId) },
                data: {
                    montant: {
                        increment: parseFloat(montant)
                    }
                }
            });
    
            return res.status(200).json(
                instance.formatResponse(
                    { transaction, updatedCagnotte },
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
    

    static async getAllOpenCagnottes(req, res) {
        try {
            // Récupérer les cagnottes avec etat = false
            const openCagnottes = await prisma.cagnotte.findMany({
                where: {
                    etat: false
                },
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
                    openCagnottes,
                    "Cagnottes ouvertes récupérées avec succès",
                    200,
                    null
                )
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json(
                instance.formatResponse(
                    null,
                    "Erreur lors de la récupération des cagnottes ouvertes",
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
        const { id } = req.params; // Assurez-vous que l'ID est passé dans les paramètres de l'URL
    
        if (!id) {
            return res.status(400).json({
                message: "L'identifiant de la cagnotte est requis."
            });
        }
    
        try {
            const cagnotte = await prisma.cagnotte.findUnique({
                where: { id: parseInt(id) }, // Assurez-vous que l'ID est un entier
                include: {
                    users_cagnotte: {
                        include: {
                            users: true
                        }
                    }
                }
            });
    
            if (!cagnotte) {
                return res.status(404).json({
                    message: "Cagnotte non trouvée."
                });
            }
    
            return res.status(200).json(cagnotte);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erreur lors de la récupération de la cagnotte.",
                error: error.message
            });
        }
    }
    
}

export default CagnotteController;
