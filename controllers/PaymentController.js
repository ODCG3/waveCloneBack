// controllers/PaymentController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class PaymentController {
    static transactionRepository = new Repository("transaction");
    static userRepository = new Repository("users");

    static async makePayment(req, res) {
        const { senderId, receiverId, amount } = req.body;
        if (!senderId || !receiverId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sender = await this.userRepository.getById(senderId);
        const receiver = await this.userRepository.getById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }

        if (sender.solde < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update sender's and receiver's balance
        sender.solde -= amount;
        receiver.solde += amount;

        await this.userRepository.update(senderId, sender);
        await this.userRepository.update(receiverId, receiver);

        // Create transaction record
        const transaction = await this.transactionRepository.create({
            montant: amount,
            exp: senderId,
            destinataire: receiverId,
            type_id: 1,  // assuming '1' corresponds to payment type
        });

        const message = transaction ? 'Payment successful' : 'Error processing payment';
        res.status(transaction ? 201 : 500).json(instance.formatResponse(transaction, message, transaction ? 201 : 500, null));
    }
    // Nouvelle méthode pour le paiement en masse
    static async makeBulkPayment(req, res) {
        const { senderId, receiverIds, amount, securityCode } = req.body;
        
        if (!senderId || !receiverIds || !amount || !securityCode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        //console.log(senderId, receiverIds, amount, securityCode);
        // Récupérer l'expéditeur
        const sender = await this.userRepository.getById(senderId);

        //console.log(sender);

        if (!sender) {
            return res.status(404).json({ error: 'Sender not found' });
        }

        // Vérifier le code de sécurité
        if (sender.code !== securityCode) {
            return res.status(403).json({ error: 'Invalid security code' });
        }

        // Vérifier le plafond du compte de l'utilisateur
        const senderRole = await this.userRepository.getById(sender.role_id);
        if (senderRole && amount > parseFloat(senderRole.plafond)) {
            return res.status(400).json({ error: 'Amount exceeds account limit' });
        }
        
        // Valider le solde pour le paiement en masse
        const totalAmount = amount * receiverIds.length;
        if (sender.solde < totalAmount) {
            return res.status(400).json({ error: 'Insufficient balance for bulk payment' });
        }

        // Initialiser une liste pour suivre les transactions réussies
        const successfulPayments = [];

        // Traiter chaque paiement
        for (const receiverId of receiverIds) {
            const receiver = await this.userRepository.getById(receiverId);
            if (!receiver) {
                console.log(`Receiver with ID ${receiverId} not found. Skipping.`);
                continue;
            }

            // Vérifier si le destinataire a un compte actif
            if (!receiver.etatcarte) {
                console.log(`Receiver with ID ${receiverId} does not have an active account. Skipping.`);
                continue;
            }

            // Mettre à jour les soldes
            const newSenderBalance = parseFloat(sender.solde) - amount;
            const newReceiverBalance = parseFloat(receiver.solde) + amount;

            await this.userRepository.update(senderId, { solde: newSenderBalance });
            await this.userRepository.update(receiverId, { solde: newReceiverBalance });

            // Enregistrer la transaction pour chaque paiement
            const transaction = await this.transactionRepository.create({
                montant: amount,
                exp: senderId,
                destinataire: receiverId,
                type_id: 1,  // '1' correspond au type de paiement
            });

            if (transaction) successfulPayments.push({ receiverId, transactionId: transaction.id });
        }

        // Répondre avec la liste des transactions réussies
        const message = successfulPayments.length > 0 ? 'Bulk payment processed successfully' : 'No payments were successful';
        res.status(successfulPayments.length > 0 ? 201 : 500).json(instance.formatResponse(successfulPayments, message, successfulPayments.length > 0 ? 201 : 500, null));
    }
}

export default PaymentController;
