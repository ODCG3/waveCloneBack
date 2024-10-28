import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class UserController {
  static repository = new Repository("users");

  static async create(req, res) {
    const user = await this.repository.create(req.body);
    const message = user ? "User created successfully" : "Error creating user";
    const status = user ? 201 : 404;
    res
      .status(status)
      .json(instance.formatResponse(user, message, status, null));
  }

  static async getAll(req, res) {
    console.log(this.repository);

    const users = await this.repository.getAll();
    const status = users ? 200 : 404;
    const message = users
      ? "Users retrieved successfully"
      : "Error retrieving users";
    res
      .status(status)
      .json(instance.formatResponse(users, message, status, null));
  }

  static async getById(req, res) {
    const user = await this.repository.getById(req.params.id);
    const status = user ? 200 : 404;
    if (!user) return res.status(404).json({ error: "User not found" });
    const message = user
      ? "User retrieved successfully"
      : "Error retrieving user";
    res
      .status(status)
      .json(instance.formatResponse(user, message, status, null));
  }

  static async update(req, res) {
    const user = await this.repository.update(req.params.id, req.body);
    const status = user ? 201 : 404;
    if (!user) return res.status(404).json({ error: "User not found" });
    const message = user ? "User updated successfully" : "Error updating user";
    res
      .status(status)
      .json(instance.formatResponse(user, message, status, null));
  }

  static async delete(req, res) {
    const user = await this.repository.delete(req.params.id);
    const status = user ? 200 : 404;
    if (!user) return res.status(404).json({ error: "User not found" });
    const message = user ? "User deleted successfully" : "Error deleting user";
    res
      .status(status)
      .json(instance.formatResponse(user, message, status, null));
  }

  static async useCodePromo(req, res) {
    const { id } = req.params;
    const { code_promo } = req.body;
    const userRepository = new Repository("users");
    const promoRepository = new Repository("code_promo");

    try {
      // Convertir l'ID en entier
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({
            message: "L'ID de l'utilisateur doit être un nombre valide",
          });
      }

      // Vérifier si l'utilisateur existe
      const user = await userRepository.getById(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier si le code promo existe
      const promo = await promoRepository.prisma.code_promo.findFirst({
        where: { libelle: code_promo },
      });
      if (!promo) {
        return res.status(404).json({ message: "Code promo invalide" });
      }

      // Vérifier si le code promo a déjà été utilisé par l'utilisateur
      if (user.used_promo_codes && user.used_promo_codes.includes(code_promo)) {
        return res.status(400).json({
          message: "Ce code promo a déjà été utilisé par cet utilisateur",
        });
      }

      // Ajouter le code promo et mettre à jour l'utilisateur
      const updatedUser = await userRepository.update(userId, {
        promo: promo.taux,
        used_promo_codes: {
          push: code_promo, // Ajoute le code promo au tableau used_promo_codes
        },
      });
 
      res.status(200).json({
        message: "Code promo appliqué avec succès",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Erreur serveur:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  //... other methods for other CRUD operations
}

export default UserController;
