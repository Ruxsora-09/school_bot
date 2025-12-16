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

  // Send initial message with "Ovoz berish" button
  return bot.sendMessage(chatId, "🗳 Ovoz berishni boshlash uchun tugmani bosing:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🗳 Ovoz berish", callback_data: "start_voting" }],
      ],
    },
  });
}

// 📋 Render all students' cards at once
async function renderAllStudents(chatId, students) {
  if (!Array.isArray(students) || students.length === 0) {
    return bot.sendMessage(chatId, "❌ O'quvchilar topilmadi.");
  }

  // Send each student's card one by one
  for (const student of students) {
    // Build caption with achievements
    let caption = `👤 *${student.name}*\n🏫 Sinf: ${student.class}\n\n`;
    
    // Add achievements if available
    if (student.achievements && Array.isArray(student.achievements) && student.achievements.length > 0) {
      caption += `🎓 Yutuqlari:\n`;
      student.achievements.forEach((achievement) => {
        caption += `• ${achievement}\n`;
      });
    }

    // Get photo path
    const fileName = path.basename(student.photo || "");
    const photoPath = path.join(process.cwd(), "Photos", fileName);

    // Send photo if exists, otherwise send text message
    if (fs.existsSync(photoPath)) {
      await bot.sendPhoto(chatId, fs.createReadStream(photoPath), {
        caption,
        parse_mode: "Markdown",
      });
    } else {
      await bot.sendMessage(chatId, caption, {
        parse_mode: "Markdown",
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // After sending all cards, send voting buttons
  const keyboard = {
    inline_keyboard: [],
  };

  students.forEach((student) => {
    keyboard.inline_keyboard.push([
      {
        text: `🗳 ${student.name} (${student.class})`,
        callback_data: `vote_${student._id}`,
      },
    ]);
  });

  return bot.sendMessage(chatId, "✅ Barcha o'quvchilar ko'rsatildi. Ovoz bering:", {
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

  // Handle "Ovoz berish" button click
  if (data === "start_voting") {
    await bot.answerCallbackQuery(q.id, {
      text: "O'quvchilar yuklanmoqda...",
      show_alert: false,
    });

    // Fetch all students from database
    const students = await Student.find().sort({ name: 1 });

    if (!Array.isArray(students) || students.length === 0) {
      return bot.sendMessage(chatId, "❌ O'quvchilar topilmadi.");
    }

    // Delete the initial message
    try {
      await bot.deleteMessage(chatId, q.message.message_id);
    } catch (error) {
      // Ignore if message can't be deleted
    }

    // Render all students' cards
    return renderAllStudents(chatId, students);
  }

  // Handle vote button clicks
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