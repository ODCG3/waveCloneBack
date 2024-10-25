import Repository from "../Database/Repository.js";
import instance from "../utils/ResponseFormatter.js";

class TransactionController {
    static repository = new Repository("transaction");

    static async transfert(req, res) {
        let data = {};
        let message = "Transaction échouée";
        let status = 400;

        try {
            const userId = req.user.userId;

            // Récupérer les données de l'utilisateur expéditeur
            const user = await this.repository.prisma.users.findFirst({
                where: { id: userId },
            });

            const { montant, destinataire } = req.body;

            // Vérifications des entrées
            if (user.telephone === destinataire) {
                return res.status(400).json({ error: 'Vous ne pouvez pas vous transférer vers vous-même' });
            }

            if (!montant) {
                return res.status(400).json({ error: 'Montant est obligatoire' });
            }

            if (!destinataire) {
                return res.status(400).json({ error: 'Destinataire est obligatoire' });
            }

            // Vérification du solde
            if (parseInt(montant) > user.solde + 100) {
                return res.status(400).json({ error: 'Solde insuffisant' });
            }

            // Récupérer les données du destinataire
            const receiver = await this.repository.prisma.users.findFirst({
                where: { telephone: destinataire },
            });

            if (!receiver) {
                return res.status(404).json({ error: 'Destinataire non trouvé' });
            }

            // Exécution de la transaction
            await this.repository.prisma.$transaction(async (prisma) => {
                // Débiter l'expéditeur
                await prisma.users.update({
                    where: { id: parseInt(userId) },
                    data: { solde: user.solde - parseFloat(montant) },
                });

                // Créditer le destinataire
                await prisma.users.update({
                    where: { id: receiver.id },
                    data: { solde: parseFloat(receiver.solde) + parseFloat(montant) },
                });

                // Créer l'enregistrement de la transaction
                const transaction = await this.repository.prisma.transaction.create({
                    data: {
                        montant: parseFloat(montant),
                        users_transaction_destinataireTousers: {
                            connect: { id: receiver.id }, // Connects `destinataire` relation
                        },
                        users_transaction_expTousers: {
                            connect: { id: userId }, // Connects `exp` relation (if the same user)
                        },
                        type: {
                            connect: { id: 1 }, // Connects type relation
                        },
                    },
                });
                

                // Mise à jour des messages de succès
                data = { sender: user, receiver, transaction, montant: parseInt(montant) };
                message = "Transaction réussie";
                status = 200;
                console.log("Transaction réussie !");
            });

            // Réponse réussie
            return res.status(status).json(instance.formatResponse(data, status, message, null));
        } catch (error) {
            console.error("Échec de la transaction:", error.message);
            return res.status(status).json({ error: message });
        } finally {
            await this.repository.prisma.$disconnect();
        }
    }
}

export default TransactionController;
