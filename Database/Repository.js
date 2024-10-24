import { PrismaClient } from '@prisma/client';

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

    async count(where) {
        return this.prisma[this.model].count({
            where,
        });
    }
}

export default Repository;