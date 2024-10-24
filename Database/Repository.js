const { PrismaClient } = require('@prisma/client');

class Repository {
    constructor(model) {
        this.prisma = new PrismaClient();
        this.model = model;
    }

    async getAll() {
        return this.prisma[this.model].findMany();
    }

    async getById(id) {
        return this.prisma[this.model].findUnique({
            where: { id },
        });
    }

    async create(data) {
        return this.prisma[this.model].create({
            data,
        });
    }

    async update(id, data) {
        return this.prisma[this.model].update({
            where: { id },
            data,
        });
    }

    async delete(id) {
        return this.prisma[this.model].delete({
            where: { id },
        });
    }

    async findMany(where) {
        return this.prisma[this.model].findMany({
            where,
        });
    }

    async findOne(where) {
        return this.prisma[this.model].findUnique({
            where,
        });
    }

    async count(where) {
        return this.prisma[this.model].count({
            where,
        });
    }
}

module.exports = Repository;
