import "dotenv/config";
import twilio from "twilio";



console.log("Account SID:", accountSid ? accountSid.substring(0, 5) + "..." : "MISSING");
console.log("Auth Token:", authToken ? "LOADED" : "MISSING");

const client = twilio(accountSid, authToken);

async function createMessage() {
  try {
    const message = await client.messages.create({
      body: "sms_2fa",
      from: "+17372508034",
      to: "+919339268656",
    });

    console.log("Message SID:", message.sid);
  } catch (error) {
    console.error("Twilio Error:");
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("More info:", error.moreInfo);
  }
}

createMessage();