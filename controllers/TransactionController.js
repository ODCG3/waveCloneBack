import Repository from "../Database/Repository.js";
import instance from "../utils/ResponseFormatter.js";
import NotificationsRepository from "../Database/repositories/NotificationsRepository.js";

const notificationsRepository = new NotificationsRepository();

class TransactionController {

static repository = new Repository("transaction");
static async calculateurFrais(req, res) {
  try {
    // Récupérer le montant depuis le corps de la requête
    const { montant } = req.body;

    if (!montant) {
      return res.status(400).json({ message: "Montant est obligatoire" });
    }

    // Calcul des frais
    const pourcentageFrais = 0.01; // 2% de frais
    const montantMinFrais = 100; // Frais minimum de 100
    let frais = montant * pourcentageFrais;

    // Si les frais calculés sont inférieurs aux frais minimums
    if (frais < montantMinFrais) {
      frais = montantMinFrais;
    }

    // Retourner la réponse
    return res.status(200).json({
      message: "Calcul des frais réussi",
      data: {
        montant,
        frais,
      },
    });
  } catch (error) {
    console.error("Erreur lors du calcul des frais:", error);
    return res.status(500).json({
      message: "Erreur serveur lors du calcul des frais",
      error: error.message,
    });
  }
}


  static async getByUserId(req, res) {
    const connectedClientID = req.user.userId;

    if (!connectedClientID) {
      return res.status(400).json({ message: "Non connecté" });
    }

    // const userId = parseInt(req.params.id);
    const userId = parseInt(connectedClientID);
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
                telephone: true,
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
                telephone: true,
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

  static async getTransactionById(req, res) {
    const connectedClientID = req.user.userId;
    if (!connectedClientID) {
      return res.status(400).json({ message: "Non connecté" });
    }
    
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    try {
      const transaction = await TransactionController.repository.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          type: true,
          users_transaction_destinataireTousers: {
            select: {
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
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
              telephone: true,
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction non trouvée" });
      }

      const message = "Transaction retrouvée avec succès";
      res.status(200).json(instance.formatResponse(transaction, message, 200, null));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  static async searchTransactions(req, res) {
    const connectedClientID = req.user.userId;
    if (!connectedClientID) {
      return res.status(400).json({ message: "Non connecté" });
    }

    try {
      const { telephone, nom, prenom, date } = req.query;

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

      const transactions = await TransactionController.repository.prisma.transaction.findMany({
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
        return res
          .status(400)
          .json({ error: "Vous ne pouvez pas vous transférer vers vous-même" });
      }

      if (!montant) {
        return res.status(400).json({ error: "Montant est obligatoire" });
      }

      if (!destinataire) {
        return res.status(400).json({ error: "Destinataire est obligatoire" });
      }

      // Vérification du solde
      if (parseInt(montant) > user.solde + 100) {
        return res.status(400).json({ error: "Solde insuffisant" });
      }

      // Récupérer les données du destinataire
      const receiver = await this.repository.prisma.users.findFirst({
        where: { telephone: destinataire },
      });

      if (!receiver) {
        return res.status(404).json({ error: "Destinataire non trouvé" });
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

        // Envoyer une notification après le paiement
        const notificationMessage = `Vous avez reçu ${montant} FCFA de ${user.nom} ${user.prenom} (${user.telephone}). Nouveau solde : ${user.solde} FCFA`;
        const notification = await notificationsRepository.createNotification({
            usersId: receiver.id,
            message: notificationMessage,
            etat: false
        });

        // Mise à jour des messages de succès
        data = {
          sender: user,
          receiver,
          transaction,
          montant: parseInt(montant),
        };
        message = "Transaction réussie";
        status = 200;
        console.log("Transaction réussie !");
      });

      // Réponse réussie
      return res
        .status(status)
        .json(instance.formatResponse(data, status, message, null));
    } catch (error) {
      console.error("Échec de la transaction:", error.message);
      return res.status(status).json({ error: message });
    } finally {
      await this.repository.prisma.$disconnect();
    }
  }

    static async depot(req,res){
        const userID = req.user.userId;
        console.log(userID);
        
        let user = await this.repository.prisma.users.findUnique({
            where: { id: userID },
        });

        if(user.role_id != 2){
            return res.status(401).json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
        }

    const code = req.body.code;

    if (user.code != code) {
      return res
        .status(401)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

        const numeroClient = req.body.numeroClient;
        const client = await this.repository.prisma.users.findFirst({ where: {
            telephone : numeroClient
        } });

    if (!client) {
      return res.status(400).json({ message: "Le numero est erronée" });
    }

    const montant = req.body.montant;

    if (!montant || montant <= 500) {
      return res.status(400).json({
        message: "Le montant est obligatoire et doit etre supperieur a 500",
      });
    }

    const data = this.repository.prisma.users.update({
      where: { id: client.id },
      data: { solde: parseFloat(client.solde) + parseFloat(montant) },
    });

    this.repository.prisma.transaction.create({
      data: {
        montant: parseFloat(montant),
        users_transaction_agentTousers: {
          connect: { id: user.id }, // Connects `exp` relation (if the same user)
        },
        users_transaction_destinataireTousers: {
          connect: { id: client.id }, // Connects `destinataire` relation
        },
        type: {
          connect: { id: 2 }, // Connects type relation
        },
      },
    });

    const message = data
      ? "Depot effectué avec succés"
      : "Erreur lors de la transaction";
    const status = data ? 200 : 400;

    return res
      .status(status)
      .json(instance.formatResponse(data, status, message, null));
  }

    static async retrait(req, res){
        let user = await this.repository.prisma.users.findUnique({
            where: { id: req.user.userId },
        });

        if(user.role_id != 2){
            return res.status(401).json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
        }

    const code = req.body.code;

    if (user.code != code) {
      return res
        .status(401)
        .json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }

        const numeroClient = req.body.numeroClient;
        const client = await this.repository.prisma.users.findFirst({ where: {
            telephone : numeroClient
        } });

    if (!client) {
      return res.status(400).json({ message: "Le numero est erronée" });
    }

    const montant = req.body.montant;

    if (!montant || montant <= 500) {
      return res.status(400).json({
        message:
          "Le montant est obligatoire et doit etre positif et supperieur a 499 francs",
      });
    }

    const retrait = await this.repository.prisma.users.update({
      where: { id: client.id },
      data: { solde: parseFloat(client.solde) - parseFloat(montant) },
    });

    const transaction = await this.repository.prisma.transaction.create({
      data: {
        montant: parseFloat(montant),
        users_transaction_agentTousers: {
          connect: { id: user.id }, // Connects `exp` relation (if the same user)
        },
        users_transaction_expTousers: {
          connect: { id: client.id }, // Connects `destinataire` relation
        },
        type: {
          connect: { id: 3 }, // Connects type relation
        },
      },
    });

    if (!transaction) {
      return res.status(400).json({
        message:
          "Une erreur est survenue lors de la création de la transaction",
      });
    }

    const status = retrait ? 201 : 400;
    const message = retrait
      ? "Retrait effectué avec succés"
      : "Erreur lors de la transaction";
    const data = retrait ? retrait : [];

    res
      .status(status)
      .json(instance.formatResponse(data, message, status, null));
  }
}

export default TransactionController;
