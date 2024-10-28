import dotenv from 'dotenv';

dotenv.config();

export const TWILIO_CONFIG = {
    accountSid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_TOKEN,
    phoneNumber: process.env.TWILIO_SENDER
};
