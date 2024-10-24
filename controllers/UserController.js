import instance from "../utils/ResponseFormatter.js";
import Repository from "../Database/Repository.js";

class UserController{
    constructor(){
        this.repository = new Repository("users");
    }
    async create(req, res) {
        const user = await this.repository.create(req.body);
        const message = user ? 'User created successfully' : 'Error creating user';
        const status = user ? 201 : 404;
        res.status(status).json(instance.formatResponse(datas, message, status, links));
    }

    async getAll(req, res) {
        const users = await this.repository.getAll();
        const status = users ? 200 : 404;
        const message = users ? 'Users retrieved successfully' : 'Error retrieving users';
        res.status(status).json(instance.formatResponse(datas, message, status, links));
    }

    async getById(req, res) {
        const user = await this.repository.getById(req.params.id);
        const status = user? 200 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user ? 'User retrieved successfully' : 'Error retrieving user';
        res.status(status).json(instance.formatResponse(datas, message, status, links));
    }

    async update(req, res) {
        const user = await this.repository.update(req.params.id, req.body);
        const status = user ? 201 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user? 'User updated successfully' : 'Error updating user';
        res.status(status).json(instance.formatResponse(datas, message, status, links));
    }

    async delete(req, res) {
        const user = await this.repository.delete(req.params.id);
        const status = user ? 200 : 404;
        if(!user) return res.status(404).json({error: 'User not found'});
        const message = user? 'User deleted successfully' : 'Error deleting user';
        res.status(status).json(instance.formatResponse(user, message, status, links));
    }

    //... other methods for other CRUD operations
}

export default UserController;