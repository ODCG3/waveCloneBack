import nodemailer from "nodemailer";

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD,
            }
        });
    }

    async sendMail(to, subject, text) {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to,
            subject,
            text,
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log("Email envoyé : ", result.response);
            return result;
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email : ", error);
            throw error;
        }
    }
}

export default new EmailService();