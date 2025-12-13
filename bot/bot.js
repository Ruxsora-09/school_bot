import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import onVote from "./onVote.js";

config();

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const CHANNEL_ID = "@group_IT101";

// 🔐 subscription check
export const checkIfUserSubscribed = async (chatId) => {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, chatId);
    return member.status !== "left" && member.status !== "kicked";
  } catch {
    return false;
  }
};

// 🟢 start + vote
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const name = msg.chat.first_name;

  const subscribed = await checkIfUserSubscribed(chatId);

  if (!subscribed) {
    return bot.sendMessage(
      chatId,
      `Hurmatli ${name},\nBotdan foydalanish uchun kanalga obuna bo‘ling 👇`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 Obuna bo'lish", url: "https://t.me/group_IT101" }],
            [{ text: "✅ Tasdiqlash", callback_data: "check_sub" }],
          ],
        },
      }
    );
  }

  if (text === "/start") {
    return bot.sendMessage(
      chatId,
      `👋 Assalomu alaykum, ${name}!
  
  🏫 Maktabimizning eng faol o‘quvchisini aniqlash uchun ovoz berish boshlandi.
  
  Davom etish uchun quyidagi tugmani bosing 👇`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🗳 Ovoz berish", callback_data: "start_vote" }],
          ],
        },
      }
    );
  }

  if (text === "/vote") {
    return onVote(msg);
  }
});

// 🔘 callback
bot.on("callback_query", async (q) => {
    const chatId = q.message.chat.id;
  
    // 🔐 har bir callbackda obuna tekshiramiz
    const subscribed = await checkIfUserSubscribed(chatId);
  
    if (!subscribed) {
      return bot.answerCallbackQuery(q.id, {
        text: "Avval kanalga obuna bo‘ling ❌",
        show_alert: true,
      });
    }
  
    if (q.data === "check_sub") {
      bot.deleteMessage(chatId, q.message.message_id);
      return bot.sendMessage(chatId, "Obuna tasdiqlandi ✅");
    }
  
    if (q.data === "start_vote") {
      return onVote(q.message);
    }
  });  

console.log("🤖 Bot ishga tushdi");
