var botId   = "st-007da037-67f9-55c3-bf93-6272ca639359";
var botName = "LLM Agent";
var sdk     = require("./lib/sdk");
var Promise = sdk.Promise;
const axios = require('axios');

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
        // En este ejemplo, usaremos un único componente para llamar al LLM
        if (componentName === 'ProcessLLM') {
            // Responde de inmediato para evitar timeout en la plataforma que llama
            callback(null, { message: "Procesando, recibirás la respuesta pronto" });
            
            // Llama a tu API LLM de forma asíncrona usando Axios
            axios.post(process.env.MY_API_URL, data, {
                headers: {
                    'Authorization': process.env.MY_API_AUTH, // Si tu API requiere autenticación
                    'Content-Type': 'application/json'
                },
                timeout: 120000  // Timeout de 2 minutos, ajustable según tus necesidades
            })
            .then(function(response) {
                console.log("Respuesta de LLM:", response.data);
                // Aquí podrías implementar la lógica para notificar al usuario o almacenar la respuesta
            })
            .catch(function(error) {
                console.error("Error al llamar a la API LLM:", error);
            });
        } else {
            // En caso de recibir otro componente, puedes optar por responder con un mensaje por defecto
            callback(null, { message: "Componente no reconocido" });
        }
    }
};
