import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import onVote, { handleVoteCallbacks } from "./onVote.js";

config();

export const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const CHANNEL_ID = "@group_IT101";

// 🔐 Obuna tekshirish
export const checkIfUserSubscribed = async (chatId) => {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, chatId);
    return member.status !== "left" && member.status !== "kicked";
  } catch {
    return false;
  }
};

// 🟢 Message listener
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const name = msg.chat.first_name;

  const subscribed = await checkIfUserSubscribed(chatId);

  if (!subscribed) {
    return bot.sendMessage(chatId, `Hurmatli ${name}, kanalga obuna bo‘ling 👇`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Obuna bo‘lish", url: "https://t.me/group_IT101" }],
          [{ text: "✅ Tasdiqlash", callback_data: "check_sub" }],
        ],
      },
    });
  }

  // faqat subscribed bo'lganlar
  if (text === "/start" || text === "/vote") {
    return onVote(msg); // bot instance endi onVote.js ichida import qilingan
  }
});

// 🔘 Callback listener
bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;

  const subscribed = await checkIfUserSubscribed(chatId);
  if (!subscribed) {
    return bot.answerCallbackQuery(q.id, {
      text: "Avval kanalga obuna bo‘ling ❌",
      show_alert: true,
    });
  }

  // ✅ Obuna tasdiqlash + avtomatik ovoz berish
  if (q.data === "check_sub") {
    await bot.deleteMessage(chatId, q.message.message_id);
    await bot.sendMessage(chatId, "Obuna tasdiqlandi ✅");

    // ovoz berishni avtomatik boshlash
    return onVote(q); // q yuboriladi, onVote ichida msg yoki q formatiga moslashadi
  }

  if (q.data === "start_vote") {
    return onVote(q.message);
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
