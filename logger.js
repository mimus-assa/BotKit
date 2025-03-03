// logger.js
require('dotenv').config(); // Carga las variables de ambiente desde .env
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("No se encontró la variable de ambiente MONGO_URI");
}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db; // para guardar la conexión y reutilizarla

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      // Se conecta a la base de datos 'koreaidebug'
      db = client.db('koreaidebug');
      console.log("Conectado a MongoDB en la DB koreaidebug");
    } catch (err) {
      console.error("Error conectándose a MongoDB:", err);
      throw err;
    }
  }
  return db;
}

async function logEvent(event) {
  try {
    const database = await connectDB();
    // Registra el log en la colección 'kore_logs'
    const logs = database.collection("kore_logs");
    await logs.insertOne({ timestamp: new Date(), event });
    console.log("Evento registrado:", event);
  } catch (err) {
    console.error("Error al registrar evento en MongoDB:", err);
  }
}

module.exports = { logEvent };
