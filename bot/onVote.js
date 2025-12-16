import Student from "../models/Student.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { bot } from "./bot.js";

// ⏳ Voting deadline — example: 2025-12-20 23:59:59
export const VOTING_DEADLINE = new Date("2025-12-24T23:59:59");

// 🗳 Ovoz berishni boshlash
export default async function onVote(msgOrQ) {
  const chatId = msgOrQ?.chat?.id || msgOrQ?.message?.chat?.id;
  if (!chatId) return;

  // ⏳ Check deadline
  if (new Date() > VOTING_DEADLINE) {
    return bot.sendMessage(chatId, "⛔ Ovoz berish muddati tugagan.");
  }

  let user = await User.findOne({ telegramId: chatId });
  if (!user) {
    user = new User({ telegramId: chatId });
    await user.save();
  }

  if (user.votedFor) {
    return bot.sendMessage(
      chatId,
      "❌ Siz allaqachon ovoz bergansiz."
    );
  }

  const students = await Student.find().sort({ name: 1 });

  if (!Array.isArray(students) || students.length === 0) {
    return bot.sendMessage(chatId, "❌ O'quvchilar topilmadi.");
  }

  // 📋 Barcha o'quvchilarni bir sahifada ko'rsatish
  return sendAllStudents(chatId, students);
}

// 📋 Barcha o'quvchilarni ko'rsatish
async function sendAllStudents(chatId, students) {
  let messageText = "🗳 *Ovoz berish*\n\n";
  messageText += "Quyidagi o'quvchilardan biriga ovoz bering:\n\n";

  // Har bir o'quvchi uchun tugma yaratish
  const keyboard = {
    inline_keyboard: [],
  };

  // Har bir o'quvchini alohida qatorga qo'yish
  students.forEach((student, index) => {
    const buttonText = `🗳 ${student.name} (${student.class})`;
    keyboard.inline_keyboard.push([
      {
        text: buttonText,
        callback_data: `vote_${student._id}`,
      },
    ]);
  });

  return bot.sendMessage(chatId, messageText, {
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
}

// 🔘 Callbacklar
export async function handleVoteCallbacks(q) {
  const chatId = q.message.chat.id;
  const data = q.data;

  // ⏳ Prevent voting after deadline
  if (new Date() > VOTING_DEADLINE) {
    return bot.answerCallbackQuery(q.id, {
      text: "⛔ Ovoz berish muddati tugagan.",
      show_alert: true,
    });
  }

  if (data.startsWith("vote_")) {
    const studentId = data.split("_")[1];

    const user = await User.findOne({ telegramId: chatId });
    if (!user) {
      return bot.answerCallbackQuery(q.id, {
        text: "❌ Xatolik yuz berdi",
        show_alert: true,
      });
    }

    if (user.votedFor) {
      return bot.answerCallbackQuery(q.id, {
        text: "❌ Siz allaqachon ovoz bergansiz",
        show_alert: true,
      });
    }

    // 🔥 OVOZ QO'SHISH
    await Student.findByIdAndUpdate(studentId, {
      $inc: { votes: 1 },
    });

    user.votedFor = studentId;
    await user.save();

    // ✅ Muvaffaqiyatli javob
    await bot.answerCallbackQuery(q.id, {
      text: "✅ Ovoz qabul qilindi!",
      show_alert: false,
    });

    // Xabarni yangilash
    const student = await Student.findById(studentId);
    return bot.editMessageText(
      `✅ *Ovoz berildi!*\n\n👤 ${student.name}\n🏫 ${student.class}\n\nRahmat! Ovozingiz qabul qilindi.`,
      {
        chat_id: chatId,
        message_id: q.message.message_id,
        parse_mode: "Markdown",
      }
    );
  }
}  