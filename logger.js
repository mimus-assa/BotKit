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
      // Puedes cambiar 'botkit' por el nombre de la base de datos que prefieras.
      db = client.db('botkit');
      console.log("Conectado a MongoDB");
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
    const logs = database.collection("logs");
    await logs.insertOne({ timestamp: new Date(), event });
    console.log("Evento registrado:", event);
  } catch (err) {
    console.error("Error al registrar evento en MongoDB:", err);
  }
}

module.exports = { logEvent };
