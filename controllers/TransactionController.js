import Repository from "../Database/Repository.js";
import instance from "../utils/ResponseFormatter.js";

class TransactionController {
  static repository = new Repository("transaction");

  static async getByUserId(req, res) {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const transactions =
        await TransactionController.repository.prisma.transaction.findMany({
          where: {
            OR: [
              { destinataire: userId },
              { agent: userId },
              { exp: userId },
              {
                users_transaction: {
                  some: {
                    users_id: userId,
                  },
                },
              },
            ],
          },
          include: {
            type: true,
            users_transaction_destinataireTousers: {
              select: {
                nom: true,
                prenom: true,
                email: true,
              },
            },
            users_transaction_agentTousers: {
              select: {
                nom: true,
                prenom: true,
                email: true,
              },
            },
            users_transaction_expTousers: {
              select: {
                nom: true,
                prenom: true,
                email: true,
              },
            },
            users_transaction: {
              include: {
                users: {
                  select: {
                    nom: true,
                    prenom: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

      const status = transactions.length ? 200 : 404;
      const message = transactions.length
        ? "Liste des transactions"
        : "Historique de transaction vide";

      res
        .status(status)
        .json(instance.formatResponse(transactions, message, status, null));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur Server" });
    }
  }

  static async searchTransactions(req, res) {
    try {
      const { telephone, nom, prenom, date} = req.query;

      // Construire le filtre de recherche pour les utilisateurs
      const userFilter = {};
      if (telephone) userFilter.telephone = { contains: telephone };
      if (nom) userFilter.nom = { contains: nom, mode: "insensitive" };
      if (prenom) userFilter.prenom = { contains: prenom, mode: "insensitive" };

      // Construire le filtre de date si nécessaire
      const dateFilter = {};
      if (date) {
        dateFilter.created_at = {};
        if (date) dateFilter.created_at.gte = new Date(date);
      }

      const transactions =
        await TransactionController.repository.prisma.transaction.findMany({
          where: {
            AND: [
              dateFilter, // Filtre de date
              {
                OR: [
                  // Recherche dans tous les rôles possibles
                  {
                    users_transaction_destinataireTousers: userFilter,
                  },
                  {
                    users_transaction_agentTousers: userFilter,
                  },
                  {
                    users_transaction_expTousers: userFilter,
                  },
                  {
                    users_transaction: {
                      some: {
                        users: userFilter,
                      },
                    },
                  },
                ],
              },
            ],
          },
          include: {
            type: true,
            users_transaction_destinataireTousers: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                telephone: true,
                email: true,
              },
            },
            users_transaction_agentTousers: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                telephone: true,
                email: true,
              },
            },
            users_transaction_expTousers: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                telephone: true,
                email: true,
              },
            },
            users_transaction: {
              include: {
                users: {
                  select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    telephone: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            id: "desc", // Tri par ID décroissant (les plus récents d'abord)
          },
        });

      const status = transactions.length ? 200 : 404;
      const message = transactions.length
        ? `${transactions.length} Transaction trouvée`
        : "Aucune transaction trouvée pour cette recherche";

      res
        .status(status)
        .json(instance.formatResponse(transactions, message, status, null));
    } catch (error) {
      console.error("Erreur de recherche transaction:", error);
      res.status(500).json({ message: "Erreur Server", error: error.message });
    }
  }
}

export default TransactionController;
