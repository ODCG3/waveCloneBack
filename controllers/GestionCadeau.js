// controllers/GestionCadeau.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class GestionCadeau {
    static userRepository = new Repository("users");
    static cadeauRepository = new Repository("cadeaux");

    static montantMinNecessaire = 500;
    static limiteCadeaux = 5;

    static async assignCadeau(req, res) {
        const { userId, montantPaiement } = req.body;

        if (!userId || !montantPaiement) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const user = await this.userRepository.getById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (parseFloat(montantPaiement) < this.montantMinNecessaire) {
                return res.status(403).json({ error: 'Payment amount is too low to qualify for a gift' });
            }

            // Correction de la requête `count`
            /* const cadeauxRecus = await this.cadeauRepository.count({
                where: { users_id: userId }
            });

            if (cadeauxRecus >= this.limiteCadeaux) {
                return res.status(403).json({ error: 'Gift limit reached for this user' });
            } */

            const montantCadeau = parseFloat((Math.random() * 1000).toFixed(2));
            const newSolde = parseFloat(user.solde) + montantCadeau;
            await this.userRepository.update(userId, { solde: newSolde });

            const cadeau = await this.cadeauRepository.create({
                montant_cadeaux: montantCadeau,
                status: "Awarded",
                users: {
                    connect: { id: userId }
                }
            });

            res.status(201).json(instance.formatResponse(cadeau, 'Gift assigned successfully', 201, null));
        } catch (error) {
            console.error("Error assigning gift:", error);
            res.status(500).json({ error: 'Failed to assign gift' });
        }
    }
}

export default GestionCadeau;
