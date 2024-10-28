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
}

export default PaymentController;
