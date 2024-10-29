// utils/qrCodeGenerator.js
import cloudinary from "./cloudinary.js";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

/**
 * Génère un QR code avec les informations utilisateur, le sauvegarde localement,
 * l'envoie vers Cloudinary et retourne l'URL du QR code.
 *
 * @param {Object} user - Les informations de l'utilisateur { id, nom, prenom, telephone }
 * @returns {Promise<string>} - L'URL du QR code sur Cloudinary
 */
export async function generateQRCode(user) {
    const qrContent = `Nom: ${user.nom}, Prénom: ${user.prenom}, Téléphone: ${user.telephone}`;
    const qrDir = path.join(process.cwd(), 'public/qrcodes');
    const tempQrPath = path.join(qrDir, `qr_${user.id}.png`);

    try {your_api_secret
        // Créer le répertoire si nécessaire
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        // Générer et sauvegarder le QR code temporairement
        await QRCode.toFile(tempQrPath, qrContent);

        // Envoyer le QR code sur Cloudinary
        const cloudinaryResult = await cloudinary.uploader.upload(tempQrPath, {
            folder: "user_qrcodes",
            public_id: `qr_${user.id}`,
            overwrite: true,
        });

        // Supprimer le fichier local après l'envoi à Cloudinary
        fs.unlinkSync(tempQrPath);

        // Retourner l'URL du QR code
        return cloudinaryResult.secure_url;

    } catch (error) {
        console.error('Erreur lors de la génération ou l\'envoi du QR Code:', error);
        throw new Error('Erreur lors de la génération du QR Code');
    }
}
