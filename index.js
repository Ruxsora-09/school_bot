import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Student from "./models/Student.js";
import User from "./models/User.js";

dotenv.config();

// 1️⃣ Initialize the bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 2️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// 3️⃣ Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Salom! Ovoz berish botiga xush kelibsiz.\nOvoz berish uchun /vote buyrug‘ini yozing.");
});

// 4️⃣ Vote command
bot.onText(/\/vote/, async (msg) => {
  const chatId = msg.chat.id;

  // Example subscription check
  try {
    const member = await bot.getChatMember("@Xiva_shahar_2_IM_matbuot_xizmati", chatId);
    if (member.status === "left") {
      return bot.sendMessage(chatId, "Avval kanalimizga obuna bo‘ling: @Xiva_shahar_2_IM_matbuot_xizmati");
    }
  } catch (err) {
    return bot.sendMessage(chatId, "Kanalga ulanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
  }

  // User logic ...
});
