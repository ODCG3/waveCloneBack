// src/controllers/TestNotificationController.js
import { sendEmail, sendSMS } from '../utils/NotificationService.js';

class TestNotificationController {
    static async testNotifications(req, res) {
        try {
            // Test de l'envoi d'email
            const testEmail = 'seck22331@gmail.com';
            const emailMessage = 'Ceci est un test d\'envoi d\'email.';
            await sendEmail(testEmail, emailMessage);
            console.log('Email envoyé avec succès à:', testEmail);

            // Test de l'envoi de SMS
            const testPhone = '+19516430741';
            const smsMessage = 'Ceci est un test d\'envoi de SMS.';
            await sendSMS(testPhone, smsMessage);
            console.log('SMS envoyé avec succès à:', testPhone);

            res.status(200).json({
                message: 'Tests d\'email et de SMS effectués avec succès.',
            });
        } catch (error) {
            console.error('Erreur lors des tests de notification:', error);
            res.status(500).json({
                message: 'Erreur lors des tests de notification.',
                error: error.message,
            });
        }
    }
}

export default TestNotificationController;
