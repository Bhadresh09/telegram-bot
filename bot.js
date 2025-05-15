const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set.");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (msg.chat.type !== "private") return;

  const ytRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/i;
  const fbRegex = /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/\S+/i;

  const urlMatch = text.match(ytRegex) || text.match(fbRegex);
  if (!urlMatch) {
    bot.sendMessage(chatId, "❌ Please send a valid YouTube or Facebook video link.");
    return;
  }

  const url = urlMatch[0];
  const fileName = `video-${Date.now()}.mp4`;
  const filePath = path.join(__dirname, fileName);

  bot.sendMessage(chatId, "⏬ Downloading your video, please wait...");

  exec(`yt-dlp -o "${filePath}" "${url}"`, (error) => {
    if (error) {
      console.error("❌ Download error:", error);
      bot.sendMessage(chatId, "❌ Failed to download video.");
      return;
    }

    bot.sendVideo(chatId, filePath, {}, { contentType: "video/mp4" })
      .then(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("⚠️ Error deleting file:", err);
        });
      })
      .catch((sendErr) => {
        console.error("❌ Error sending video:", sendErr);
        bot.sendMessage(chatId, "❌ Error sending the video.");
      });
  });
});
