import twilio from "twilio";

class SendSms {
    static client = twilio(process.env.twilioSid, process.env.twilioToken);

    static async send(to, message) {
        try {
            await this.client.messages.create({
                body: message,
                from: process.env.twilioNumber,
                to,
            });
            console.log("SMS sent successfully");
        } catch (error) {
            console.error("Error sending SMS:", error);
        }
    }
}

export default SendSms;
