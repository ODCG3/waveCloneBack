// controllers/ClassementController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class ClassementController {
    static userRepository = new Repository("users");
    static transactionRepository = new Repository("transaction");

    static async getRanking(req, res) {
        try {
            // Obtenir les utilisateurs avec leurs transactions
            const usersWithTransactions = await this.userRepository.prisma.users.findMany({
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    transaction_transaction_expTousers: {
                        select: {
                            id: true
                        }
                    }
                }
            });

            // Calculer le nombre de transactions pour chaque utilisateur
            const userRanking = usersWithTransactions.map(user => ({
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                telephone: user.telephone,
                transactionCount: user.transaction_transaction_expTousers.length
            }));

            // Trier les utilisateurs par nombre de transactions et sélectionner les 3 premiers
            const topThreeUsers = userRanking
                .sort((a, b) => b.transactionCount - a.transactionCount)
                .slice(0, 3);  // Garde uniquement les 3 premiers

            // Envoyer le classement des 3 premiers au client
            res.status(200).json(instance.formatResponse(topThreeUsers, 'Top 3 users retrieved successfully', 200, null));
        } catch (error) {
            console.error("Error retrieving user ranking:", error);
            res.status(500).json({ error: 'Failed to retrieve user ranking' });
        }
    }
}

export default ClassementController;
