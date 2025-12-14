import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import onVote, { handleVoteCallbacks } from "./onVote.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

config();

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const CHANNEL_ID = "@Xiva_shahar_2_IM_matbuot_xizmati";
const ADMINS = [5515269338]; // 🔒 admin ID

// 🔐 Obuna tekshirish
export const checkIfUserSubscribed = async (chatId) => {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, chatId);
    return member.status !== "left" && member.status !== "kicked";
  } catch {
    return false;
  }
};

// 🟢 MESSAGE LISTENER
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const name = msg.chat.first_name;

  // 🔒 ADMIN /results
  if (text === "/results") {
    if (!ADMINS.includes(chatId)) {
      return bot.sendMessage(chatId, "❌ Siz admin emassiz.");
    }
  
    const students = await Student.find().sort({ votes: -1 });
  
    if (!students.length) {
      return bot.sendMessage(chatId, "Hali ovoz yo‘q.");
    }
  
    let msgText = "📊 Ovozlar:\n\n";
  
    for (const s of students) {
      msgText += `👤 ${s.name} — ${s.votes} ta ovoz\n`;
    }
  
    return bot.sendMessage(chatId, msgText);
  }
  

  // 🔐 Obuna tekshirish (oddiy userlar uchun)
  const subscribed = await checkIfUserSubscribed(chatId);
  if (!subscribed) {
    return bot.sendMessage(chatId, `Hurmatli ${name}, kanalga obuna bo‘ling 👇`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📢 Obuna bo‘lish",
              url: "https://t.me/Xiva_shahar_2_IM_matbuot_xizmati",
            },
          ],
          [{ text: "✅ Tasdiqlash", callback_data: "check_sub" }],
        ],
      },
    });
  }

  // 🗳 Start / Vote
  if (text === "/start" || text === "/vote") {
    return onVote(msg);
  }
});

// 🔘 CALLBACK LISTENER
bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;

  const subscribed = await checkIfUserSubscribed(chatId);
  if (!subscribed) {
    return bot.answerCallbackQuery(q.id, {
      text: "Avval kanalga obuna bo‘ling ❌",
      show_alert: true,
    });
  }

  // ✅ Obuna tasdiqlash → avtomatik vote
  if (q.data === "check_sub") {
    await bot.deleteMessage(chatId, q.message.message_id);
    await bot.sendMessage(chatId, "Obuna tasdiqlandi ✅");
    return onVote(q);
  }

  if (
    q.data === "prev" ||
    q.data === "next" ||
    q.data.startsWith("vote_")
  ) {
    return handleVoteCallbacks(q);
  }
});

console.log("🤖 Bot ishga tushdi");