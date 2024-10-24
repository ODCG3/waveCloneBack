// controllers/MerchantPaymentController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import { connect } from "mongoose";

class MerchantPaymentController {
    static transactionRepository = new Repository("transaction");
    static userRepository = new Repository("users");
    static roleRepository = new Repository("role");
    static usersTransactionRepository = new Repository("users_transaction");

    static async payMerchant(req, res) {
        const { userId, vendeurId, amount, type_id = 2 } = req.body; // type_id = 2 pour paiement marchand par défaut

        if (!userId || !vendeurId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Récupération du client et du vendeur
        const client = await this.userRepository.getById(userId);
        const vendeur = await this.userRepository.getById(vendeurId);

        if (!client) {
            console.error('Client not found with ID:', userId);
            return res.status(404).json({ error: 'Client not found' });
        }
        
        if (!vendeur) {
            console.error('Vendeur not found with ID:', vendeurId);
            return res.status(404).json({ error: 'Vendeur not found' });
        }

        // Vérification des rôles du client et du vendeur
        const clientRole = await this.roleRepository.getById(client.role_id);
        if (!clientRole || clientRole.libelle !== 'client') {
            console.error('Invalid role for client:', clientRole);
            return res.status(403).json({ error: 'User is not authorized as a client' });
        }

        const vendeurRole = await this.roleRepository.getById(vendeur.role_id);
        if (!vendeurRole || vendeurRole.libelle !== 'vendeur') {
            console.error('Invalid role for vendeur:', vendeurRole);
            return res.status(403).json({ error: 'Recipient is not a valid vendor' });
        }

        const clientSolde = parseFloat(client.solde) || 0;
        const paymentAmount = parseFloat(amount);

        if (clientSolde < paymentAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        const newClientBalance = parseFloat((clientSolde - paymentAmount).toFixed(2));
        const newVendeurBalance = parseFloat((parseFloat(vendeur.solde || 0) + paymentAmount).toFixed(2));

        await this.userRepository.update(userId, { solde: newClientBalance });
        await this.userRepository.update(vendeurId, { solde: newVendeurBalance });

        // Créer une transaction
        try {
            const transaction = await this.transactionRepository.create({
                    montant: paymentAmount,
                    users_transaction_expTousers: {
                        connect: { id: userId }
                    },                   // Utilisateur effectuant le paiement
                    users_transaction_destinataireTousers: {
                        connect: { id: vendeurId }
                    },        // Vendeur qui reçoit le paiement
                    type: {
                        connect: { id: type_id }
                    }                // Assurez-vous que type_id est valide (existe dans la table `type`)
                
            });

            // Ajouter une entrée dans `users_transaction`
            await this.usersTransactionRepository.create({
                users_id: userId,
                transaction_id: transaction.id,
                role: 'client'  // ou un rôle plus pertinent si disponible
            });

            const message = transaction ? 'Merchant payment successful' : 'Error processing merchant payment';
            res.status(transaction ? 201 : 500).json(instance.formatResponse(transaction, message, transaction ? 201 : 500, null));
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: 'Failed to create transaction due to foreign key constraint' });
        }
    }
}

export default MerchantPaymentController;
