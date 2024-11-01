// controllers/BillPaymentController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class BillPaymentController {
    static factureRepository = new Repository("facture");
    static userRepository = new Repository("users");
    static societeRepository = new Repository("societe");

    static async payBill(req, res) {
        const { userId, numeroFacture, montantTotal, montantPaye, societeId } = req.body;

        if (!userId || !numeroFacture || !montantTotal || !montantPaye || !societeId) {
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

        if (user.solde < montantPaye) {
            return res.status(400).json({ error: 'Insufficient balance to pay the bill' });
        }

        
        // Create or update the bill record
        const facture = await this.factureRepository.create({
            user_id: userId,
            numero_facture: numeroFacture,
            montant_total: montantTotal,
            montant_paye: montantPaye,
            societe_id: societeId,
            status: 'Paid',
        });
        
        // Update user's balance
        user.solde -= montantPaye;
        await this.userRepository.update(userId, user);

        const message = facture ? 'Bill paid successfully' : 'Error processing bill payment';
        res.status(facture ? 201 : 500).json(instance.formatResponse(facture, message, facture ? 201 : 500, null));
    }

    static async getAllBills(req, res) {
        const bills = await this.factureRepository.getAll();
        const status = bills ? 200 : 404;
        const message = bills
            ? "Bills retrieved successfully"
            : "Error retrieving bills";
        res
            .status(status)
            .json(instance.formatResponse(bills, message, status, null));
    }

    static async getAllSocieties(req, res) {
        const societes = await this.societeRepository.getAll();
        const status = societes ? 200 : 404;
        const message = societes
            ? "Societies retrieved successfully"
            : "Error retrieving societies";
        res
            .status(status)
            .json(instance.formatResponse(societes, message, status, null));
    }

    
}

export default BillPaymentController;
