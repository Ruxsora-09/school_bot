import Student from "../models/Student.js";
import User from "../models/User.js";
import { bot } from "./bot.js";

export default async function onVote(msg) {
  const chatId = msg.chat.id;

  let user = await User.findOne({ telegramId: chatId });
  if (!user) {
    user = new User({ telegramId: chatId });
    await user.save();
  }

  if (user.votedFor) {
    return bot.sendMessage(
      chatId,
      `Siz allaqachon ${user.votedFor} uchun ovoz bergansiz ❌`
    );
  }

  const students = await Student.find();
  if (students.length === 0) {
    return bot.sendMessage(chatId, "Talabalar topilmadi.");
  }

  const keyboard = students.map((s) => [
    { text: s.name, callback_data: `vote_${s._id}` },
  ]);

  bot.sendMessage(chatId, "Talabani tanlang:", {
    reply_markup: { inline_keyboard: keyboard },
  });
}
