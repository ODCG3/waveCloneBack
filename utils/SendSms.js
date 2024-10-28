import twilio from "twilio";

class SendSms {
    static client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

    static async send(to, message) {
        try {
            await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_SENDER,
                to,
            });
            console.log("SMS sent successfully");
        } catch (error) {
            console.error("Error sending SMS:", error);
        }
    }
}

export default SendSms;
