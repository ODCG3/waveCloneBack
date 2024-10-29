import dotenv from 'dotenv';

dotenv.config();

export const TWILIO_CONFIG = {
    accountSid: process.env.twilioSid,
    authToken: process.env.twilioToken,
    phoneNumber: process.env.twilioNumber
};
