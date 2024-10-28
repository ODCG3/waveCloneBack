// seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Créer des utilisateurs
  const user1 = await prisma.users.create({
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '0123456789',
      email: 'jean.dupont@example.com',
      solde: 100.00,
      code: 'CODE123',
      promo: 10.00,
      carte: 'CARTE123',
      etatcarte: true,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      nom: 'Martin',
      prenom: 'Sophie',
      telephone: '0987654321',
      email: 'sophie.martin@example.com',
      solde: 50.00,
      code: 'CODE456',
      promo: 5.00,
      carte: 'CARTE456',
      etatcarte: false,
    },
  });

  // Créer des cadeaux
  const cadeau1 = await prisma.cadeaux.create({
    data: {
      users_id: user1.id,
      montant_cadeaux: 20.00,
      status: 'Pending',
    },
  });

  const cadeau2 = await prisma.cadeaux.create({
    data: {
      users_id: user2.id,
      montant_cadeaux: 15.00,
      status: 'Approved',
    },
  });

  // Créer des cagnottes
  const cagnotte1 = await prisma.cagnotte.create({
    data: {
      users_id: user1.id,
      montant: 200.00,
      montant_objectif: 500.00,
    },
  });

  // Créer des codes promo
  const promoCode1 = await prisma.code_promo.create({
    data: {
      libelle: 'Promo Été',
      taux: 15.00,
    },
  });

  // Créer des demandes de remboursement
  const remboursement1 = await prisma.demandes_remboursement.create({
    data: {
      users_id: user2.id,
      montant: 30.00,
      motif: 'Erreur de paiement',
      status: 'Pending',
    },
  });

  // Créer des invitations
  const invitation1 = await prisma.invitation.create({
    data: {
      users_id: user1.id,
      message: 'Rejoignez notre plateforme!',
    },
  });

  console.log({ user1, user2, cadeau1, cadeau2, cagnotte1, promoCode1, remboursement1, invitation1 });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
