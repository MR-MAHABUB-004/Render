const axios = require("axios");


const baseApiUrl = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/APIURL.json");
  return res.data.sim; 
};

const simTag = "\u200B"; 

module.exports.config = {
  name: "janu",
  aliases: ["jan"],
  version: "1.4.1",
  author: "MR᭄﹅ MAHABUB﹅ メꪜ",
  countDown: 0,
  role: 0,
  description: "Janu Simisimi",
  category: "chat",
  guide: { en: "Type 'Janu' or use {pn} [text]" }
};

const askAPI = async (text, uid) => {
  try {
    const url = await baseApiUrl();
    const res = await axios.get(`${url}/ask?q=${encodeURIComponent(text)}&uid=${uid}`);
    return res.data?.reply || "আমি এটা জানি না 🥲";
  } catch (err) {
    return "আমি এটা জানি না 🥲";
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  try {
    const text = args.join(" ");
    const uid = event.senderID;

    if (!text) return api.sendMessage("🫶 Janu ki bolbo?", event.threadID, event.messageID);

    const reply = await askAPI(text, uid);
    api.sendMessage(reply + simTag, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    if (!event.body) return;
    const body = event.body.trim();
    const uid = event.senderID;

    if (body.toLowerCase() === "janu" || body.toLowerCase() === "jan") {
      return api.sendMessage("🫶 Janu ki bolbo?", event.threadID, event.messageID);
    }

    if (body.toLowerCase().startsWith("janu ") || body.toLowerCase().startsWith("jan ")) {
      const text = body.replace(/^(janu|jan)\s+/i, "").trim();
      const reply = await askAPI(text, uid);
      api.sendMessage(reply + simTag, event.threadID, event.messageID);
      return;
    }

    if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
      const botMsg = event.messageReply.body;
      const isTrigger = botMsg.includes("🫶 Janu ki bolbo?") || botMsg.includes(simTag);

      if (isTrigger) {
        const reply = await askAPI(event.body, uid);
        api.sendMessage(reply + simTag, event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.error(error);
  }
};
