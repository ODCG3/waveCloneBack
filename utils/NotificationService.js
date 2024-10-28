// src/utils/NotificationService.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Invitation',
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès à', to);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error; // Relancer l'erreur si besoin
    }
};

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendSMS = async (to, message) => {
    try {
        const messageResponse = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_SENDER,
            to,
        });
        console.log('SMS envoyé avec succès à', to);
        return messageResponse;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        throw error; // Relancer l'erreur si besoin
    }
};
