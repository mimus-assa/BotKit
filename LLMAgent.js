var botId   = "st-007da037-67f9-55c3-bf93-6272ca639359";
var botName = "LLM Agent";
var sdk     = require("./lib/sdk");
var Promise = sdk.Promise;
const axios = require('axios');
// Importamos el logger que creaste en logger.js (ubicado en la raíz)
const { logEvent } = require('./logger');

module.exports = {
    botId   : botId,
    botName : botName,

    // Para mensajes entrantes del usuario
    on_user_message: function(requestId, data, callback) {
        sdk.sendBotMessage(data, callback);
    },

    // Para mensajes del bot hacia el usuario
    on_bot_message: function(requestId, data, callback) {
        sdk.sendUserMessage(data, callback);
    },

    // Manejo del webhook para procesar el LLM
    on_webhook: function(requestId, data, componentName, callback) {
        if (componentName === 'ProcessLLM') {
            // Log: Se recibió el webhook
            logEvent(`Received ProcessLLM webhook for requestId: ${requestId}`)
              .catch(err => console.error("Error registrando log:", err));
            
            // Responde de inmediato para evitar timeout en la plataforma que llama
            callback(null, new sdk.AsyncResponse());
            
            // Llama a tu API LLM de forma asíncrona usando Axios
            axios.post(process.env.MY_API_URL, {
                "question": data.context.userInputs.originalInput.sentence,
                "user_name": "koreai_user"
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 120000  // Timeout de 2 minutos
            })
            .then(function(response) {
                data.context.respuestaLLM = response.data;
                sdk.respondToHook(data);
                console.log("Respuesta de LLM:", response.data);
                // Log: Llamada exitosa a la API LLM
                logEvent(`LLM API call succeeded for requestId: ${requestId}`)
                  .catch(err => console.error("Error registrando log:", err));
            })
            .catch(function(error) {
                console.error("Error al llamar a la API LLM:", error);
                // Log: Error en la llamada a la API LLM
                logEvent(`LLM API call error for requestId: ${requestId}: ${error.message}`)
                  .catch(err => console.error("Error registrando log:", err));
            });
        } else {
            // Componente no reconocido
            callback(null, { message: "Componente no reconocido" });
        }
    }
};
