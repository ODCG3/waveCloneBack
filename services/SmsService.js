// services/SmsService.js
import twilio from 'twilio';
import { TWILIO_CONFIG } from '../config/twilio.js';

class SmsService {
    static twilioClient = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);

    static async envoyerSMS(telephone, message) {
        try {
            const response = await this.twilioClient.messages.create({
                body: message,
                from: TWILIO_CONFIG.phoneNumber,
                to: telephone
            });

            console.log('SMS envoyé avec succès:', response.sid);
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du SMS:', error);
            throw error;
        }
    }
}

export default SmsService;