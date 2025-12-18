import mongoose from "mongoose";
import Student from "./models/Student.js";

const MONGO_URI = "mongodb+srv://ruxsora:ruxsora2009@cluster0.m1nbpxz.mongodb.net/SchoolBotDB?appName=Cluster0";

// Original votes data
const originalVotes = [
  { name: "Polvonnazirova Zahro", votes: 112 },
  { name: "Baxtiyorov Ulug'bek", votes: 97 },
  { name: "Nazirboyev Nurnazir", votes: 61 },
  { name: "Allaberganov Salohiddin", votes: 51 },
  { name: "Oybekov Asadbek", votes: 41 },
  { name: "Bekturdiyev Shohruz", votes: 35 },
  { name: "Odilbekova Ruxsora", votes: 31 },
  { name: "Allaberganova Madina", votes: 29 },
  { name: "Bayjonova Dilnura", votes: 19 },
  { name: "Qurbondurdiyev Yusufboy", votes: 15 },
  { name: "Jumanazarova Asaloy", votes: 12 },
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB...");

  for (const student of originalVotes) {
    const result = await Student.updateOne(
      { name: student.name },
      { $set: { votes: student.votes } }
    );
    console.log(`✅ ${student.name} — ${student.votes} ta ovoz qaytarildi`);
  }

  console.log("\n🎉 Barcha ovozlar muvaffaqiyatli qaytarildi!");
  process.exit();
};

run();

