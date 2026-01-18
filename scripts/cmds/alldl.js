const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");
const https = require("https");

module.exports = {
  config: {
    name: 'auto',
    version: '5.4',
    author: 'MR᭄﹅ MAHABUB﹅ メꪜ',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto video downloader',
    category: 'media',
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage("📥 Send the link to download the video 🎥", event.threadID);
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body.trim();

    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const videoLink = linkMatch[0];
    api.setMessageReaction("♻", event.messageID, () => {}, true);

    const isFacebook = videoLink.includes("facebook.com");
    const headers = isFacebook
      ? {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Referer": "https://www.facebook.com/"
        }
      : { "User-Agent": "Mozilla/5.0" };

    const httpsAgent = isFacebook ? new https.Agent({ family: 4 }) : undefined;
    const apiBaseURL = global.GoatBot.config.api;
    const filePath = "video.mp4";

    // Helper: delay between retries
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Retry system
    const fetchWithRetry = async (url, retries = 3) => {
      for (let i = 1; i <= retries; i++) {
        try {
          return await axios.get(url, { headers, httpsAgent });
        } catch (error) {
          if (i === retries) throw error;
          await wait(2000); // wait 2s before retry
        }
      }
    };

    try {
      const response = await fetchWithRetry(
        `${apiBaseURL}/mahabub/dl?url=${encodeURIComponent(videoLink)}`
      );

      const { platform, title, hd, sd } = response.data;
      const downloadURL = hd || sd;
      if (!downloadURL) return api.setMessageReaction("✖", event.messageID, () => {}, true);

      const downloadWithRetry = (url, retries = 3) => {
        return new Promise((resolve, reject) => {
          const attempt = (count) => {
            const stream = request({ url, headers })
              .pipe(fs.createWriteStream(filePath))
              .on("close", () => resolve())
              .on("error", async (err) => {
                if (count < retries) {
                  await wait(2000);
                  attempt(count + 1);
                } else {
                  reject(err);
                }
              });
          };
          attempt(1);
        });
      };

      await downloadWithRetry(downloadURL);

      api.setMessageReaction("✔", event.messageID, () => {}, true);
      await api.sendMessage({
        body: `✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱!\n\n📌 Platform: ${platform || "Unknown"}\n🎬 Title: ${title || "No Title"}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));

    } catch {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      // Silent fail — no error message shown
    }
  }
};
