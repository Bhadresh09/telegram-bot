const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const express = require("express");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN is not set.");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (msg.chat.type !== "private") return; // only private chats

  const ytRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/i;
  const fbRegex = /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/\S+/i;

  const urlMatch = text.match(ytRegex) || text.match(fbRegex);
  if (!urlMatch) {
    bot.sendMessage(chatId, "Please send a valid YouTube or Facebook video link.");
    return;
  }

  const url = urlMatch[0];
  const fileName = `video-${Date.now()}.mp4`;

  bot.sendMessage(chatId, "⏬ Downloading your video, please wait...");

  exec(`yt-dlp -f best -o ${fileName} "${url}"`, (error) => {
    if (error) {
      bot.sendMessage(chatId, "❌ Failed to download video.");
      console.error("Download error:", error);
      return;
    }

    bot.sendVideo(chatId, fileName).then(() => {
      exec(`rm ${fileName}`, (rmErr) => {
        if (rmErr) console.error("Error deleting file:", rmErr);
      });
    }).catch((sendErr) => {
      bot.sendMessage(chatId, "❌ Error sending the video.");
      console.error("Send error:", sendErr);
    });
  });
});

// Express server to keep Render happy
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Telegram video downloader bot is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
