import { PrismaClient } from "@prisma/client";

class Repository {
  constructor(model) {
    this.prisma = new PrismaClient();
    this.model = model;
  }

  async getAll() {
    return this.prisma[this.model].findMany();
  }

  async getAllClients() {
    return this.prisma[this.model].findMany({
      where: { role_id: 4 },
    });
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

  async find(where, include = null) {
    return this.prisma[this.model].findMany({
      where,
      ...(include && { include }),
    });
  }

  async getAllByUserId(userId) {
    return this.prisma[this.model].findMany({
      where: { user_id: userId }, // Assuming `user_id` is the foreign key column in your `facture` table
    });
  }
}


export default Repository;
