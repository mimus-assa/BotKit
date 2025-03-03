// app.js

var Application = require("./lib/app");
var Server      = require("./lib/server");
var sdk         = require("./lib/sdk");
var config      = require("./config");
const { logEvent } = require("./logger");

// 1) Sobrescribe el puerto para usar process.env.PORT si existe, 
//    o usa config.server.port, o un 8003 por defecto.
const port = process.env.PORT || config.server.port || 8003;
config.server.port = parseInt(port, 10);  // con parseInt por buena práctica

var app    = new Application(null, config);
var server = new Server(config, app);

sdk.checkNodeVersion();

try {
  // 2) Inicias el servidor normalmente
  server.start();  
  // Registra en Mongo que el servidor arrancó
  logEvent("Servidor arrancó correctamente desde app.js");
} catch (error) {
  logEvent(`Error al iniciar el servidor: ${error.message}`);
  console.error("Error al iniciar el servidor:", error);
}

// Registro de tus bots
sdk.registerBot(require('./FindAFlight.js'));
sdk.registerBot(require('./SimpleConversationalBot.js'));
sdk.registerBot(require('./SimpleConversationalBotWithMultipleBotId.js'));
sdk.registerBot(require('./GuessTheNumber.js'));
sdk.registerBot(require('./BookACab.js'));
sdk.registerBot(require('./OrderAPizza.js'));
sdk.registerBot(require('./BotVariables.js'));
sdk.registerBot(require('./LiveChat.js'));
