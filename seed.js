import mongoose from "mongoose";
import Student from "./models/Student.js";

const MONGO_URI = "mongodb+srv://ruxsora:ruxsora2009@cluster0.m1nbpxz.mongodb.net/SchoolBotDB?appName=Cluster0";

const students = [
  {
    name: "Polvonnazirova Zahro",
    class: "11-A",
    // Rasmlar papkasi nomi 'Photos' bo‘lganligi uchun shu yerda ham shuni ishlatamiz
    photo: "./Photos/Zahro.jpg",
    achievements: [
      "CEFR C1 darajasi (66 ball)",
      "IELTS: 8.0 ball",
      "SAT: 1390 ball",
      "Ibrat Debate: Khiva koordinatori",
      "Ingliz tili fan olimpiadasi: shahar bosqichida 1-o‘rin (10–11-sinflar o‘rtasida)"
    ]
  },
  {
    name: "Bayjonova Dilnura",
    class: "11-A",
    photo: "./Photos/Dilnura.jpg",
    achievements: [
      "Xalqaro Kavkaz Matematika Olimpiadasi — 2023-yil",
      "Al-Xorazmiy olimpiadasi (xalqaro) — bronza medal",
      "Viloyat hokimi olimpiadasi — 2-o‘rin",
      "“Hokim kubogi” — 1-o‘rin",
      "STEM olimpiadasi — 2-o‘rin",
      "Milliy sertifikat: Matematika A+ (78.53 ball)",
      "CEFR B2 (58 ball)",
      "SAT: 1230 ball"
    ]
  },
  {
    name: "Bekturdiyev Shohruz",
    class: "11-B",
    photo: "./Photos/Shohruz.jpg",
    achievements: [
      "IELTS 6.5 / CEFR B2",
      "Rasm tanlovida 1-o‘rin",
      "“Turon Yulbarslari” harbiy musobaqasi — 4-o‘rin"
    ]
  },
  {
    name: "Nazirboyev Nurnazir",
    class: "10-A",
    photo: "./Photos/Nurnazir.jpg",
    achievements: [
      "“Iqtidor” tanlovida 2-o‘rin",
      "CEFR B2 darajasi",
      "8-mart tanlovida 2-o‘rin (2023)",
      "2025-yilda maktab bosh sardori"
    ]
  },
  {
    name: "Oybekov Asadbek",
    class: "10-A",
    photo: "./Photos/Asadbek.jpg",
    achievements: [
      "Davlat va huquq asoslari fanidan shahar olimpiyadasi — 1-o‘rin",
      "Idrok teleko‘rsatuvi 1-bosqich — 1-o‘rin",
      "CEFR B2 (56 ball)"
    ]
  },
  {
    name: "Odilbekova Ruxsora",
    class: "10-B",
    photo: "./Photos/Ruxsora.jpg",
    achievements: [
      "IELTS: 7.5 ball",
      "IT Park Ideaton tanlovi: 2-o‘rin",
      "IT community Debate: 2-o‘rin",
      "Informatika fan olimpiadasi: shahar bosqichida 1-o‘rin",
      "Ingliz tili fan olimpiadasi: shahar bosqichida 1-o‘rin"
    ]
  },
  {
    name: "Baxtiyorov Ulug'bek",
    class: "9-B",
    photo: "./Photos/Ulugbek.jpg",
    achievements: [
      "Jamoaviy shaxmat musobaqasi — 1-o‘rin (21.10.2024)",
      "Maktab birinchiligi — 1-o‘rin (20.03.2025)",
      "Viloyat bosqichida sovrinli o‘rin, Respublika bosqichiga yo‘llanma",
      "Maktablar Ligasi (9–11-sinflar) — 2-o‘rin (22.10.2025)",
      "Shaxmat turniri (18-may 2025) — 2-o‘rin"
    ]
  },
  {
    name: "Allaberganova Madina",
    class: "8-A",
    photo: "./Photos/Madina.jpg",
    achievements: [
      "HIPPO Turkiya bosqichiga yo‘llanma",
      "Rasm tanlovlarida faol ishtirokchi",
      "STEM olimpiadasining viloyat bosqichida faol qatnashgan",
      "Youth Science Fair — 'Eng yaxshi taqdimot'",
      "“Ixtirokchilikka qadam” loyihasida faol ishtirok"
    ]
  },
  {
    name: "Jumanazarova Asaloy",
    class: "7-B",
    photo: "./Photos/Asaloy.jpg",
    achievements: [
      "STEM olimpiadasi — Science, viloyat bosqichi: 1-o‘rin",
      "“Kitobxonlik tanlovi 2025” maktab bosqichi: 1-o‘rin",
      "“Ustoz va murabbiylar kuni” tanlovida faxrli o‘rin",
      "Maktab tomonidan 10 ta sertifikat bilan taqdirlangan",
      "“Kitobxon millatmiz” respublika tanlovida faol ishtirok"
    ]
  },
  {
    name: "Allaberganov Salohiddin",
    class: "7-B",
    photo: "./Photos/Salohiddin.jpg",
    achievements: [
      "Video rolik tanlovi (1-oktyabr) — 1-o‘rin",
      "“Umid nihollari” shaxmat musobaqasi — 1-o‘rin",
      "“5 tashabbus” shaxmat musobaqasi: Shahar — 1-o‘rin, Viloyat — 2-o‘rin",
      "“FIDE 101 yilligi” shaxmat — 5-o‘rin",
      "“Xiva yozi” — 7/7 ochko bilan 1-o‘rin",
      "“Oltin kuzning Rapid turniri” — 3-o‘rin",
      "“Xiva bahori” — 3-o‘rin"
    ]
  },
  {
    name: "Qurbondurdiyev Yusufboy",
    class: "7-B",
    photo: "./Photos/Yusufboy.jpg",
    achievements: [
      "“Iqtidor” tanlovida 1-o‘rin",
      "“Tilga e’tibor — elga e’tibor” tanlovida faxrli o‘rin"
    ]
  }
];

const run = async () => {
  await mongoose.connect(MONGO_URI);

  await Student.deleteMany({});
  await Student.insertMany(students);

  console.log("📌 O‘quvchilar Atlas (MongoDB) bazasiga muvaffaqiyatli yuklandi!");
  process.exit();
};

run();
