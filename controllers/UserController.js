import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";
import SendSms from "../utils/SendSms.js";
import readline from 'readline';

class UserController{
    
    static repository  = new Repository("users");

    static generateCode = (telephone,nom,prenom) => {
        return Math.round(Math.random() * 10000) + "_"+telephone[3]+telephone[2]+nom+prenom.length;
    }
    
    static async create(req, res) {
        const { nom, prenom, telephone, email, solde = 0, promo = 0, etatCarte = true, roleId } = req.body;
    
        // Basic validation
        if (!nom || !prenom || !telephone || !email || !roleId) {
            return res.status(400).json(instance.formatResponse(null, "All fields are required", 400, null));
        }

        // Check if user already exists with same email or telephone
        const userExists = await this.repository.prisma.users.findFirst({
            where: { OR: [{ email }, { telephone }] },
        });
    
        if (userExists) {
            return res.status(400).json(instance.formatResponse(null, "User with this email or telephone already exists", 400, null));
        }
    
        // Generate verification code and send it via SMS
        const code = this.generateCode(telephone, nom, prenom);
        console.log("Generated code:", code);
    
        // Send SMS with code
        await SendSms.send('+221' + telephone, code);
    
        // Check if role exists
        const role = await this.repository.prisma.role.findUnique({
            where: { id: roleId },
        });
    
        if (!role) {
            return res.status(400).json(instance.formatResponse(null, "Invalid role ID", 400, null));
        }
    
        // Save user to database with generated code
        const user = await this.repository.create({
            nom,
            prenom,
            telephone,
            email,
            solde,
            promo,
            etatcarte: etatCarte,
            role:{
                connect: { id: roleId },
            },
            code,  // save code to compare later
            carte: "img.png",
        });
    
        const message = user ? 'User created successfully' : 'Error creating user';
        const status = user ? 201 : 404;
        return res.status(status).json(instance.formatResponse(user, message, status, null));
    }
    
    static async getAll(req, res) {
        console.log(this.repository);
        
        const users = await this.repository.getAll();
        const status = users ? 200 : 404;
        const message = users ? 'Users retrieved successfully' : 'Error retrieving users';
        res.status(status).json(instance.formatResponse(users, message, status, null));
    }

    static async getById(req, res) {
        const user = await this.repository.getById(req.params.id);
        const status = user? 200 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user ? 'User retrieved successfully' : 'Error retrieving user';
        res.status(status).json(instance.formatResponse(user, message, status, null));
    }

    static async update(req, res) {
        const user = await this.repository.update(req.params.id, req.body);
        const status = user ? 201 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user? 'User updated successfully' : 'Error updating user';
        res.status(status).json(instance.formatResponse(user, message, status, null));
    }

    static async delete(req, res) {
        const user = await this.repository.delete(req.params.id);
        const status = user ? 200 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user? 'User deleted successfully' : 'Error deleting user';
        res.status(status).json(instance.formatResponse(user, message, status, null));
    }

}

export default UserController;