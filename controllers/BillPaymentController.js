// controllers/BillPaymentController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import NotificationsRepository from "../Database/repositories/NotificationsRepository.js";
const notificationsRepository = new NotificationsRepository();

class BillPaymentController {
    static factureRepository = new Repository("facture");
    static userRepository = new Repository("users");
    static societeRepository = new Repository("societe");

    static async payBill(req, res) {
        try {
            const { userId, numeroFacture, montantTotal, societeId } = req.body;
    
            if (!userId || !numeroFacture || !montantTotal || !societeId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
    
            const user = await this.userRepository.getById(userId);
            const societe = await this.societeRepository.getById(societeId);
    
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            if (!societe) {
                return res.status(404).json({ error: 'Society not found' });
            }
    
            if (user.solde < montantTotal) {
                return res.status(400).json({ error: 'Insufficient balance to pay the bill' });
            }
    
            // Create or update the bill record
            const facture = await this.factureRepository.create({
                user_id: userId,
                numero_facture: numeroFacture,
                montant_total: montantTotal,
                societe_id: societeId,
                status: 'Paid',
                Date: new Date().toISOString()
            });
    
            // Update user's balance
            user.solde -= montantTotal;
            await this.userRepository.update(userId, user);
    
            // Préparer les données de réponse incluant les informations de la société
            const responseData = {
                data: {
                    id: facture.id,
                    user_id: userId,
                    numero_facture: numeroFacture,
                    montant_total: montantTotal,
                    societe_id: societeId,
                    status: 'Paid',
                    Date: facture.Date
                },
                message: 'Bill paid successfully',
                status: 201,
                links: null
            };
    
            // Envoyer une notification après le paiement
            const notificationMessage = `Vous avez payé ${montantTotal} FCFA pour ${numeroFacture} de ${societe.nom} le ${facture.Date}.`;
            const notification = await notificationsRepository.createNotification({
                usersId: userId,
                message: notificationMessage,
                etat: false
            });
    
            res.status(201).json(responseData);
        } catch (error) {
            console.error("Error in payBill:", error);
            res.status(500).json({ error: 'An error occurred while processing the bill payment' });
        }
    }
    

    static async getAllBills(req, res) {
        try {
            const bills = await this.factureRepository.getAll();
            const status = bills ? 200 : 404;
            const message = bills
                ? "Bills retrieved successfully"
                : "Error retrieving bills";
            res
                .status(status)
                .json(instance.formatResponse(bills, message, status, null));
        } catch (error) {
            console.error("Error in getAllBills:", error);
            res.status(500).json({ error: 'An error occurred while retrieving bills' });
        }
    }

    static async getAllSocieties(req, res) {
        try {
            const societes = await this.societeRepository.getAll();
            const status = societes ? 200 : 404;
            const message = societes
                ? "Societies retrieved successfully"
                : "Error retrieving societies";
            res
                .status(status)
                .json(instance.formatResponse(societes, message, status, null));
        } catch (error) {
            console.error("Error in getAllSocieties:", error);
            res.status(500).json({ error: 'An error occurred while retrieving societies' });
        }
    }

    //afficher tous les factures de l'utilisateur connecté
    static async getMyBills(req, res) {
        try {
            const userId = req.user.userId; // Supposons que `req.user.userId` contient l'ID de l'utilisateur authentifié
            console.log("Fetching bills for userId:", userId);
            
            // Récupérer toutes les factures de l'utilisateur
            const bills = await this.factureRepository.getAllByUserId(userId);
            
            if (!bills || bills.length === 0) {
                return res.status(404).json({ error: "No bills found for this user" });
            }
    
            // Récupérer les détails de la société pour chaque facture
            const detailedBills = await Promise.all(bills.map(async (bill) => {
                const societe = await this.societeRepository.getById(bill.societe_id);
                return {
                    ...bill,
                    societe: {
                        id: societe.id,
                        nom: societe.nom,
                        secteur: societe.secteur,
                        telephone: societe.telephone,
                    }
                };
            }));
    
            // Formater la réponse
            const status = 200;
            const message = "Bills retrieved successfully";
            
            res.status(status).json(instance.formatResponse(detailedBills, message, status, null));
        } catch (error) {
            console.error("Error in getMyBills:", error);
            res.status(500).json({ error: "An error occurred while retrieving bills" });
        }
    }
    
}

export default BillPaymentController;
