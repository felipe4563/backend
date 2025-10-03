// En tu archivo ../watsap/watsapclient.js
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Crear cliente y guardar sesión localmente
const client = new Client({
    authStrategy: new LocalAuth()
});

// Evento QR
client.on('qr', (qr) => {
    console.log("Escanea este QR en tu WhatsApp:");
    qrcode.generate(qr, { small: true });
});

// Evento listo
client.on('ready', () => {
    console.log('WhatsApp Web listo ✅');
});

// Manejo de errores de autenticación
client.on('auth_failure', msg => {
    console.error('❌ Falló autenticación:', msg);
});

// Inicializar cliente
client.initialize();

// Función para formatear número boliviano
function formatPhoneNumber(numero) {
    if (!numero) return null;
    numero = numero.replace(/\D/g, '');
    if (numero.startsWith('591')) return `+${numero}`;
    if (numero.startsWith('0')) return `+591${numero.slice(1)}`;
    return `+591${numero}`;
}

// Función para enviar mensaje (modificada para aceptar imagen)
const sendWhatsApp = async (numero, mensaje, imagePath = null) => {
    if (!client.info) {
        await new Promise(resolve => client.once('ready', resolve));
    }
    
    const chatId = formatPhoneNumber(numero).replace('+', '') + '@c.us';

    try {
        if (imagePath) {
            // Enviar mensaje con imagen
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(chatId, media, { caption: mensaje });
        } else {
            await client.sendMessage(chatId, mensaje);
        }
        console.log('Mensaje enviado a', numero);
        return true;
    } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        throw error;
    }
};
module.exports = { client, sendWhatsApp };