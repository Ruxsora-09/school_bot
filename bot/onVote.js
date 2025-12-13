import Student from "../models/Student.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { bot } from "./bot.js";

export const userState = {};

// 🗳 Ovoz berish boshlash
export default async function onVote(msgOrQ) {
  const chatId = msgOrQ.chat?.id || msgOrQ.message?.chat?.id;
  if (!chatId) return;

  let user = await User.findOne({ telegramId: chatId });
  if (!user) {
    user = new User({ telegramId: chatId });
    await user.save();
  }

  // 🔒 agar ovoz bergan bo‘lsa
  if (user.votedFor) {
    return bot.sendMessage(chatId, "❌ Siz allaqachon ovoz bergansiz. Qayta ovoz berish mumkin emas.");
  }

  const students = await Student.find();
  if (!students.length) {
    return bot.sendMessage(chatId, "O‘quvchilar topilmadi.");
  }

  userState[chatId] = 0;

  // ovoz berish xabarini yuborish
  await bot.sendMessage(chatId, "🗳 Ovoz berishni boshlaymiz!");
  sendStudent(chatId, students);
}

// 🔥 Student chiqarish funksiyasi
export function sendStudent(chatId, students) {
  const index = userState[chatId];
  const s = students[index];

  const caption = `
👤 ${s.name}
🏫 Sinf: ${s.class}

🎓 Yutuqlari:
${s.achievements.map(a => "• " + a).join("\n")}
  `.trim();

  const photoPath = path.resolve(s.photo);

  bot.sendPhoto(chatId, fs.createReadStream(photoPath), {
    caption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⬅️ Oldingi", callback_data: "prev" },
          { text: "➡️ Keyingi", callback_data: "next" },
        ],
        [
          { text: "🗳 Ovoz berish", callback_data: `vote_${s._id}` },
        ],
      ],
    },
  });
}

// 🗳 Callbacklar uchun
export async function handleVoteCallbacks(q) {
  const chatId = q.message.chat.id;
  const data = q.data;

  const students = await Student.find();
  if (!students.length) return;

  if (userState[chatId] === undefined) userState[chatId] = 0;

  // ⬅️ Oldingi
  if (data === "prev") {
    userState[chatId] = (userState[chatId] - 1 + students.length) % students.length;
    return sendStudent(chatId, students);
  }

  // ➡️ Keyingi
  if (data === "next") {
    userState[chatId] = (userState[chatId] + 1) % students.length;
    return sendStudent(chatId, students);
  }

  // 🗳 Ovoz berish
  if (data.startsWith("vote_")) {
    const studentId = data.split("_")[1];

    const user = await User.findOne({ telegramId: chatId });
    if (user.votedFor) {
      return bot.answerCallbackQuery(q.id, {
        text: "❌ Siz allaqachon ovoz bergansiz",
        show_alert: true,
      });
    }

    user.votedFor = studentId;
    await user.save();

    return bot.sendMessage(chatId, "✅ Ovoz qabul qilindi! Rahmat 💙");
  }
}