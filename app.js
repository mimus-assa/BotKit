// app.js

var Application = require("./lib/app");
var Server      = require("./lib/server");
var sdk         = require("./lib/sdk");
var config      = require("./config");

// 1. Importas el logger (ajusta la ruta si tu logger.js está en otra ubicación)
const { logEvent } = require("./logger");

var app    = new Application(null, config);
var server = new Server(config, app);

sdk.checkNodeVersion();

try {
  // 2. Inicias el servidor
  server.start();
  
  // 3. Registra el evento en la colección "kore_logs" (según tu logger.js)
  logEvent("Servidor arrancó correctamente desde app.js");
  
} catch (error) {
  // En caso de que server.start() lance una excepción
  logEvent(`Error al iniciar el servidor: ${error.message}`);
  console.error("Error al iniciar el servidor:", error);
}

// Registro de los bots
sdk.registerBot(require('./FindAFlight.js'));
sdk.registerBot(require('./SimpleConversationalBot.js'));
sdk.registerBot(require('./SimpleConversationalBotWithMultipleBotId.js'));
sdk.registerBot(require('./GuessTheNumber.js'));
sdk.registerBot(require('./BookACab.js'));
sdk.registerBot(require('./OrderAPizza.js'));
sdk.registerBot(require('./BotVariables.js'));
sdk.registerBot(require('./LiveChat.js'));
