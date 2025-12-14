import Student from "../models/Student.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { bot } from "./bot.js";

export const userState = {};

// 🗳 Ovoz berishni boshlash
export default async function onVote(msgOrQ) {
  const chatId = msgOrQ?.chat?.id || msgOrQ?.message?.chat?.id;
  if (!chatId) return;

  // User ma'lumotlarini DBga yozish
  await User.findOneAndUpdate(
    { telegramId: chatId },
    {
      telegramId: chatId,
      username: msg.chat.username || null,
      firstName: msg.chat.first_name || null,
      lastName: msg.chat.last_name || null
    },
    { upsert: true, new: true }
  );

  if (user.votedFor) {
    return bot.sendMessage(
      chatId,
      "❌ Siz allaqachon ovoz bergansiz."
    );
  }

  const students = await Student.find();

  if (!Array.isArray(students) || students.length === 0) {
    return bot.sendMessage(chatId, "❌ O‘quvchilar topilmadi.");
  }

  userState[chatId] = 0;

  await bot.sendMessage(chatId, "🗳 Ovoz berishni boshlaymiz!");
  return sendStudent(chatId, students);
}

// 👤 Studentni chiqarish
function sendStudent(chatId, students) {
  if (!Array.isArray(students)) {
    console.log("❌ students undefined:", students);
    return;
  }

  const index = userState[chatId] ?? 0;
  const s = students[index];

  if (!s) {
    return bot.sendMessage(chatId, "❌ O‘quvchi topilmadi.");
  }

  const caption = `
👤 ${s.name}
🏫 Sinf: ${s.class}

🎓 Yutuqlari:
${s.achievements.map(a => "• " + a).join("\n")}
`.trim();

  const photoPath = path.join(process.cwd(), s.photo);

  const keyboard = {
    inline_keyboard: [
      [
        { text: "⬅️ Oldingi", callback_data: "prev" },
        { text: "➡️ Keyingi", callback_data: "next" },
      ],
      [{ text: "🗳 Ovoz berish", callback_data: `vote_${s._id}` }],
    ],
  };

  if (!fs.existsSync(photoPath)) {
    return bot.sendMessage(chatId, caption, {
      reply_markup: keyboard,
    });
  }

  return bot.sendPhoto(chatId, fs.createReadStream(photoPath), {
    caption,
    reply_markup: keyboard,
  });
}

// 🔘 Callbacklar
export async function handleVoteCallbacks(q) {
  const chatId = q.message.chat.id;
  const data = q.data;

  const students = await Student.find();
  if (!students.length) return;

  if (userState[chatId] === undefined) {
    userState[chatId] = 0;
  }

  if (data === "prev") {
    userState[chatId] =
      (userState[chatId] - 1 + students.length) % students.length;
    return sendStudent(chatId, students);
  }

  if (data === "next") {
    userState[chatId] =
      (userState[chatId] + 1) % students.length;
    return sendStudent(chatId, students);
  }

  if (data.startsWith("vote_")) {
    const studentId = data.split("_")[1];
  
    const user = await User.findOne({ telegramId: chatId });
    if (user.votedFor) {
      return bot.answerCallbackQuery(q.id, {
        text: "❌ Siz allaqachon ovoz bergansiz",
        show_alert: true,
      });

    }
  
    // 🔥 OVOZ QO‘SHISH
    await Student.findByIdAndUpdate(studentId, {
      $inc: { votes: 1 },
    });
  
    user.votedFor = studentId;
    await user.save();
  
    return bot.sendMessage(chatId, "✅ Ovoz qabul qilindi!");
  }
}  