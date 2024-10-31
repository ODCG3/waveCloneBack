import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import SendSms from "../utils/SendSms.js";
import readline from 'readline';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BlackList from "../utils/BlackList.js";
import EmailService from "../Services/EmailService.js";
import { log } from "console";
import path from 'path';

import { generateQRCode } from "../utils/qrCodeGenerator.js";

class UserController {

    static repository = new Repository("users");

    static generateCode = (telephone, nom, prenom) => {
        return Math.round(Math.random() * 10000) + "_" + telephone[3] + telephone[2] + nom + prenom.length;
    }

    static async create(req, res) {
        const { nom, prenom, telephone, email, solde = 0, promo = 0, etatCarte = true, roleId } = req.body;

        // Validation des champs requis
        if (!nom || !prenom || !telephone || !email || !roleId) {
            return res.status(400).json(instance.formatResponse(null, "Tous les champs sont requis", 400, null));
        }

        // Vérifier si l'utilisateur existe déjà
        const userExists = await this.repository.prisma.users.findFirst({
            where: { OR: [{ email }, { telephone }] },
        });

        if (userExists) {
            return res.status(400).json(instance.formatResponse(null, "Un utilisateur avec cet email ou téléphone existe déjà", 400, null));
        }

        // Générer un code de vérification et l'envoyer par SMS
        const code = this.generateCode(telephone, nom, prenom);
        console.log("Generated code:", code);

        // Envoyer le code par SMS
        await SendSms.send('+221' + telephone, code);

        // Vérifier si le rôle existe
        const role = await this.repository.prisma.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            return res.status(400).json(instance.formatResponse(null, "ID de rôle invalide", 400, null));
        }

        // Créer l'utilisateur dans la base de données avec un chemin local temporaire
        const tempQrPath = path.join('public', 'qrcodes', `qr_${Date.now()}.png`);
        const user = await this.repository.create({
            nom,
            prenom,
            telephone,
            email,
            solde,
            promo,
            etatcarte: etatCarte,
            role: { connect: { id: roleId } },
            code,  // Sauvegarder le code pour comparaison ultérieure
            carte: tempQrPath,  // Temporaire, sera remplacé par l'URL du QR code
        });

        if (!user) {
            return res.status(404).json(instance.formatResponse(null, "Erreur lors de la création de l'utilisateur", 404, null));
        }

        try {
            // Générer le QR code et obtenir l'URL de Cloudinary
            const qrUrl = await generateQRCode(user);

            // Mettre à jour la colonne `carte` avec l'URL du QR code
            await this.repository.update(user.id, { carte: qrUrl });

            return res.status(201).json(instance.formatResponse(user, 'Utilisateur créé avec succès et QR Code généré', 201, null));

        } catch (error) {
            console.error('Erreur lors de la génération du QR Code:', error);
            return res.status(500).json({ error: 'Erreur lors de la génération du QR Code' });
        }
    }

    static async login(req, res) {
        const numero = req.body.numero;

        if (!numero) {
            return res.status(400).json({ error: 'Numero de téléphone est obligatoire' });
        }

        if (!req.body.code) {
            return res.status(400).json({ error: 'Code est obligatoire' });
        }

        const user = await this.repository.prisma.users.findFirst({
            where: { telephone: numero }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.code !== req.body.code) {
            return res.status(401).json({ error: 'Invalid code' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: true,
            path: "/",
        });

        res.status(200).json({ token, user });

    }

    static logout(req, res) {
        const token = req.cookies.token; // or retrieve it from headers, e.g., req.headers.authorization

        // Add the token to the blacklist
        if (token) BlackList.add(token);

        console.log(BlackList.isBlacklisted(req.cookies.token), token);
        // Clear the cookie
        res.clearCookie("token", {
            httpOnly: true,
            path: "/",
        });

        res.status(200).json("logged out");
    }


    static async getAll(res) {
        console.log(this.repository);

        const users = await this.usersRepository.getAll();
        const status = users ? 200 : 404;
        const message = users ? 'Users retrieved successfully' : 'Error retrieving users';
        res.status(status).json(instance.formatResponse(users, message, status, null));

    }


    static async reinitializeCode(req, res) {
        const { telephone, code } = req.body;

        if (!telephone) {
            return res.status(400).json({ error: 'Numéro de téléphone est obligatoire' });
        }

        if (!code) {
            return res.status(400).json({ error: 'Code est obligatoire' });
        }

        const user = await this.repository.prisma.users.findFirst({
            where: { telephone: telephone }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const data = await this.repository.prisma.users.update({
            where: { id: user.id },
            data: { code: code },
        });

        const status = data ? 201 : 404;
        const message = data ? 'Code reinitialisé avec succès' : 'Erreur lors de la réinitialisation du code';

        return res.status(200).json(instance.formatResponse(data, status, message, null));
    }

   static async getById(req, res) {
    try {
        // Convertir req.params.id en entier
        const id = parseInt(req.params.id, 10);
       //console.log(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await this.repository.getById(id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Créer une copie de l'objet utilisateur sans le champ `code`
        const { code, ...userWithoutCode } = user;

        const message = 'User retrieved successfully';
        res.status(200).json(instance.formatResponse(userWithoutCode, message, 200, null));
    } catch (error) {
        // Gérer les erreurs éventuelles
        res.status(500).json({ error: 'An error occurred while retrieving the user' });
    }
}


    

    static async update(req, res) {
        const user = await this.repository.update(parseInt(req.params.id, 10), req.body);
        const status = user ? 201 : 404;

        if (!user) return res.status(404).json({ error: 'User not found' });
        const message = user ? 'User updated successfully' : 'Error updating user';

        res.status(status).json(instance.formatResponse(user, message, status, null));
    }

    static async delete(req, res) {
        const user = await this.repository.delete(req.params.id);
        const status = user ? 200 : 404;

        if (!user) return res.status(404).json({ error: 'User not found' });
        const message = user ? 'User deleted successfully' : 'Error deleting user';

        res.status(status).json(instance.formatResponse(user, message, status, null));
    }

    // Méthode pour signaler un problème
    static async reportIssue(req, res) {
        try {
            const userId = req.user.userId;
            console.log("user :", req.user);

           console.log("id :", userId);

            const { message } = req.body;

            // Sauvegarder l'issue dans la base de données
            const issueRepo = new Repository("issues");
            const issue = await issueRepo.create({ users_id: userId, message });

            // Récupérer les informations de l'utilisateur
            const userRepo = new Repository("users");
            const user = await userRepo.getById(userId);

            // Envoi d'un e-mail à l'administrateur
            await EmailService.sendMail(
                process.env.ADMIN_SUPPORT_EMAIL,
                'Nouvelle demande de support utilisateur',
                `L'utilisateur ${user.prenom} ${user.nom} a signalé un problème : ${message}`
            );

            res.status(201).json(instance.formatResponse(issue, 'Problème signalé avec succès', 201, null));
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json(instance.formatResponse(null, 'Erreur lors du signalement du problème', 500, error.message));
        }
    }


    // Méthode pour que les admins répondent directement à une issue dans l'application
    static async respondToIssueInApp(req, res) {
        try {
            const { issueId, response } = req.body;

            // Mettre à jour la réponse de l'admin dans la base de données
            const issueRepo = new Repository("issues");
            const updatedIssue = await issueRepo.update(issueId, { response });

            if (!updatedIssue) return res.status(404).json({ error: 'Problème non trouvé' });

            // Récupérer l'utilisateur lié à l'issue
            const userRepo = new Repository("users");
            const user = await userRepo.getById(updatedIssue.users_id);

            // Envoi de la réponse par e-mail à l'utilisateur avec le nom et prénom
            await EmailService.sendMail(
                user.email,
                'Réponse à votre demande de support',
                `Votre problème : ${updatedIssue.message}\n\nRéponse de l'administrateur : ${response}\n\nCordialement,\n${user.firstName} ${user.lastName}`
            );

            res.status(200).json(instance.formatResponse(updatedIssue, 'Réponse enregistrée et envoyée avec succès', 200, null));
        } catch (error) {
            res.status(500).json(instance.formatResponse(null, 'Erreur lors de la réponse à l\'issue', 500, error.message));
        }
    }

    static async useCodePromo(req, res) {
        const { id } = req.params;
        const { code_promo } = req.body;
        const userRepository = new Repository("users");
        const promoRepository = new Repository("code_promo");

        try {
            // Convertir l'ID en entier
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                return res
                    .status(400)
                    .json({
                        message: "L'ID de l'utilisateur doit être un nombre valide",
                    });
            }

            // Vérifier si l'utilisateur existe
            const user = await userRepository.getById(userId);
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            // Vérifier si le code promo existe
            const promo = await promoRepository.prisma.code_promo.findFirst({
                where: { libelle: code_promo },
            });
            if (!promo) {
                return res.status(404).json({ message: "Code promo invalide" });
            }

            // Vérifier si le code promo a déjà été utilisé par l'utilisateur
            if (user.used_promo_codes && user.used_promo_codes.includes(code_promo)) {
                return res.status(400).json({
                    message: "Ce code promo a déjà été utilisé par cet utilisateur",
                });
            }

            // Ajouter le code promo et mettre à jour l'utilisateur
            const updatedUser = await userRepository.update(userId, {
                promo: promo.taux,
                used_promo_codes: {
                    push: code_promo, // Ajoute le code promo au tableau used_promo_codes
                },
            });

            res.status(200).json({
                message: "Code promo appliqué avec succès",
                user: updatedUser,
            });
        } catch (error) {
            console.error("Erreur serveur:", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    }

    static async getStatistiques(req, res) {
        try {
            const userID = req.user.userId;
    
            // Fetch the user
            const user = await this.repository.prisma.users.findFirst({
                where: { id: userID }
            });
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            // Fetch statistics using Promise.all for better performance
            const [
                totalDepot,
                totalRetrait,
                totalTransfert,
                totalPaiements,
                // totalOperations,
                avgDepot,
                avgRetrait,
                maxDepot,
                minRetrait,
                // latestDepotDate
            ] = await Promise.all([
                // Sum of deposits
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 2 },
                    _sum: { montant: true },
                }),
                // Sum of withdrawals
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 3 },
                    _sum: { montant: true },
                }),
                // Sum of transfers
                this.repository.prisma.transaction.aggregate({
                    where: { exp: userID, type_id: 1 },
                    _sum: { montant: true },
                }),
                // Sum of payments
                this.repository.prisma.transaction.aggregate({
                    where: { exp: userID, type_id: 4 },
                    _sum: { montant: true },
                }),
                // // Count total operations
                // this.repository.prisma.transaction.count({
                //     where: { users_id: userID }
                // }),
                // Average deposit amount
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 2 },
                    _avg: { montant: true },
                }),
                // Average withdrawal amount
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 3 },
                    _avg: { montant: true },
                }),
                // Maximum deposit amount
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 2 },
                    _max: { montant: true },
                }),
                // Minimum withdrawal amount
                this.repository.prisma.transaction.aggregate({
                    where: { destinataire: userID, type_id: 3 },
                    _min: { montant: true },
                }),
                // Latest deposit date
                // this.repository.prisma.transaction.findFirst({
                //     where: { destinataire: userID, type_id: 2 },
                //     orderBy: { date: 'desc' },
                //     select: { date: true }
                // })
            ]);
    
            // Respond with the aggregated statistics
            res.status(200).json({
                user,
                totalDepot: totalDepot._sum.montant || 0,
                totalRetrait: totalRetrait._sum.montant || 0,
                totalTransfert: totalTransfert._sum.montant || 0,
                totalPaiements: totalPaiements._sum.montant || 0,
                // totalOperations,
                avgDepot: avgDepot._avg.montant || 0,
                avgRetrait: avgRetrait._avg.montant || 0,
                maxDepot: maxDepot._max.montant || 0,
                minRetrait: minRetrait._min.montant || 0,
                // latestDepotDate: latestDepotDate?.date || null,
            });
        } catch (error) {
            console.error("Erreur serveur:", error);
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    }
    
    static async linkToBankAccount(req, res) {
        const id = req.user.userId;

        const user = await this.repository.prisma.users.findFirst({
            where: { id }
        })

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const numeroCompte = req.body.numeroCompte;
        const dateValidation = req.body.dateValidation;
        const cvv = req.body.cvv;
        const bankName = req.body.bankName;

        if(!numeroCompte || !dateValidation || !cvv) {
            return res.status(400).json({ message: "Toutes Les champs sont requis" });
        }

        if(numeroCompte.length !== 13) {
            return res.status(400).json({ message: "Le numéro de compte est incorrect" });
        }

        // date validattions format mm-dd accepted
        const dateValidationFormat = dateValidation.split("-");

        if(dateValidationFormat.length !== 2) {
            return res.status(400).json({ message: "La date de validation est incorrecte" });
        }

        const dateValidationArray = dateValidationFormat.map(Number);

        if(dateValidationArray[0] > 12 || dateValidationArray[1] > 31 || dateValidationArray[0] < 1 || dateValidationArray[1] < 1) {
            return res.status(400).json({ message: "La date de validation est incorrecte" });
        }

        
        if(cvv.toString().length !== 3) {
            return res.status(400).json({ message: "Le CVV est incorrect" });
        }

        const bankAccount = await this.repository.prisma.bankaccount.create({
            data: {
                account_number: numeroCompte,
                dateexpiration: dateValidation,
                cvv,
                name: bankName,
                users: { connect: { id } }
            }
        })

        const status = bankAccount ? 201 : 404;
        const message = bankAccount ? 'Compte créé avec succès' : 'Erreur lors de la création du compte';
        const data = bankAccount? bankAccount : null;

        res.status(status).json(instance.formatResponse(data, message, status, null));
    }

    static async getBankAccount(req, res) {
        const id = req.user.userId;
        const user = await this.repository.prisma.users.findFirst({
            where: { id }
        })

        console.log(user);
        

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const bankAccount = await this.repository.prisma.bankaccount.findMany({
            where: { users_id: id }
        })

        const status = bankAccount ? 200 : 404;
        const message = bankAccount ? 'Compte retrouvé avec succès' : 'Erreur lors de la récupération du compte';
        const data = bankAccount? bankAccount : null;

        return res.status(status).json(instance.formatResponse(data, message, status, null));
    }

}

export default UserController;
