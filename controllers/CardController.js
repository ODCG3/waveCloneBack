// controllers/CardController.js
import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class CardController {
    static userRepository = new Repository("users");

    static async lockCard(req, res) {
        const { userId } = req.body;

        const user = await this.userRepository.getById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        //verifier si la carte est déjà verrouillée
        if (user.etatcarte=false) {
            return res.status(400).json({ error: 'Card is already unlocked' });
        }
        //si la carte est déjà verrouillée, on la débloque
        //sinon, on la verrouille
        else {
            user.etatcarte = false;
            await this.userRepository.update(userId, user);
        }
      /*   res.status(200).json(instance.formatResponse(user, 'Card unlocked successfully', 200, null));
        //lock la carte
        user.etatcarte = false;
        await this.userRepository.update(userId, user); */

        res.status(200).json(instance.formatResponse(user, 'Card locked successfully', 200, null));
    }
}

export default CardController;
