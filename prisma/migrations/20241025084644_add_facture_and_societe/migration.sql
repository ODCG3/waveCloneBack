-- CreateTable
CREATE TABLE "cadeaux" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "montant_cadeaux" DECIMAL(10,2),
    "status" VARCHAR(20) DEFAULT 'Pending',

    CONSTRAINT "cadeaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cagnotte" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "montant" DECIMAL(10,2),
    "montant_objectif" DECIMAL(10,2),

    CONSTRAINT "cagnotte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_promo" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(50),
    "taux" DECIMAL(5,2),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "code_promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_remboursement" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "montant" DECIMAL(10,2) NOT NULL,
    "motif" TEXT,
    "status" VARCHAR(20) DEFAULT 'Pending',
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "demandes_remboursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "message" TEXT,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "message" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "message" TEXT,
    "etat" BOOLEAN,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poche" (
    "id" SERIAL NOT NULL,
    "users_id" INTEGER,
    "montant" DECIMAL(10,2),
    "type" VARCHAR(50),
    "date_limite" DATE,

    CONSTRAINT "poche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(100),
    "contenu" TEXT,
    "description" TEXT,

    CONSTRAINT "promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(50),
    "plafond" DECIMAL(10,2),

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "destinataire" INTEGER,
    "agent" INTEGER,
    "exp" INTEGER,
    "type_id" INTEGER,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(50) NOT NULL,

    CONSTRAINT "type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50),
    "prenom" VARCHAR(50),
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "solde" DECIMAL(10,2),
    "code" VARCHAR(50),
    "promo" DECIMAL(5,2),
    "carte" VARCHAR(50),
    "etatcarte" BOOLEAN,
    "role_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_cadeaux" (
    "users_id" INTEGER NOT NULL,
    "cadeau_id" INTEGER NOT NULL,
    "role" VARCHAR(50),

    CONSTRAINT "users_cadeaux_pkey" PRIMARY KEY ("users_id","cadeau_id")
);

-- CreateTable
CREATE TABLE "users_cagnotte" (
    "users_id" INTEGER NOT NULL,
    "cagnotte_id" INTEGER NOT NULL,

    CONSTRAINT "users_cagnotte_pkey" PRIMARY KEY ("users_id","cagnotte_id")
);

-- CreateTable
CREATE TABLE "users_demandes" (
    "users_id" INTEGER NOT NULL,
    "demande_id" INTEGER NOT NULL,

    CONSTRAINT "users_demandes_pkey" PRIMARY KEY ("users_id","demande_id")
);

-- CreateTable
CREATE TABLE "users_issues" (
    "users_id" INTEGER NOT NULL,
    "issue_id" INTEGER NOT NULL,

    CONSTRAINT "users_issues_pkey" PRIMARY KEY ("users_id","issue_id")
);

-- CreateTable
CREATE TABLE "users_notification" (
    "users_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,

    CONSTRAINT "users_notification_pkey" PRIMARY KEY ("users_id","notification_id")
);

-- CreateTable
CREATE TABLE "users_poche" (
    "users_id" INTEGER NOT NULL,
    "poche_id" INTEGER NOT NULL,

    CONSTRAINT "users_poche_pkey" PRIMARY KEY ("users_id","poche_id")
);

-- CreateTable
CREATE TABLE "users_promo" (
    "users_id" INTEGER NOT NULL,
    "promo_id" INTEGER NOT NULL,

    CONSTRAINT "users_promo_pkey" PRIMARY KEY ("users_id","promo_id")
);

-- CreateTable
CREATE TABLE "users_transaction" (
    "users_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "role" VARCHAR(50),

    CONSTRAINT "users_transaction_pkey" PRIMARY KEY ("users_id","transaction_id")
);

-- CreateTable
CREATE TABLE "facture" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "numero_facture" VARCHAR(50) NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "montant_paye" DECIMAL(10,2) NOT NULL,
    "societe_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "societe" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "secteur" VARCHAR(50) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,

    CONSTRAINT "societe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telephone_key" ON "users"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cadeaux" ADD CONSTRAINT "cadeaux_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cagnotte" ADD CONSTRAINT "cagnotte_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "demandes_remboursement" ADD CONSTRAINT "demandes_remboursement_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "poche" ADD CONSTRAINT "poche_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_agent_fkey" FOREIGN KEY ("agent") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_destinataire_fkey" FOREIGN KEY ("destinataire") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_exp_fkey" FOREIGN KEY ("exp") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_cadeaux" ADD CONSTRAINT "users_cadeaux_cadeau_id_fkey" FOREIGN KEY ("cadeau_id") REFERENCES "cadeaux"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_cadeaux" ADD CONSTRAINT "users_cadeaux_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_cagnotte" ADD CONSTRAINT "users_cagnotte_cagnotte_id_fkey" FOREIGN KEY ("cagnotte_id") REFERENCES "cagnotte"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_cagnotte" ADD CONSTRAINT "users_cagnotte_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_demandes" ADD CONSTRAINT "users_demandes_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "demandes_remboursement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_demandes" ADD CONSTRAINT "users_demandes_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_issues" ADD CONSTRAINT "users_issues_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_issues" ADD CONSTRAINT "users_issues_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_notification" ADD CONSTRAINT "users_notification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_notification" ADD CONSTRAINT "users_notification_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_poche" ADD CONSTRAINT "users_poche_poche_id_fkey" FOREIGN KEY ("poche_id") REFERENCES "poche"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_poche" ADD CONSTRAINT "users_poche_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_promo" ADD CONSTRAINT "users_promo_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "promo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_promo" ADD CONSTRAINT "users_promo_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_transaction" ADD CONSTRAINT "users_transaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_transaction" ADD CONSTRAINT "users_transaction_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_societe_id_fkey" FOREIGN KEY ("societe_id") REFERENCES "societe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
