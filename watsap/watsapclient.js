const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Configurar ruta absoluta para la sesión
const sessionPath = path.join(__dirname, 'wwebjs_sessions');

// Crear cliente con configuración mejorada
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot",
        dataPath: sessionPath  // Ruta específica para sesiones
    }),
    puppeteer: { 
        executablePath: '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--headless=new'  // Modo headless mejorado
        ]
    }
});

// Evento QR (solo se muestra si no hay sesión guardada)
client.on('qr', (qr) => {
    console.log("🔄 Escanea este QR en tu WhatsApp (válido por 30 segundos):");
    qrcode.generate(qr, { small: true });
});

// Evento de autenticación exitosa (GUARDA LA SESIÓN)
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa - Sesión guardada');
});

// Evento listo
client.on('ready', () => {
    console.log('🚀 WhatsApp Web conectado y listo');
    console.log('💾 Sesión guardada en:', sessionPath);
});

// Manejo de errores de autenticación
client.on('auth_failure', msg => {
    console.error('❌ Falló autenticación:', msg);
    console.log('💡 Elimina la carpeta de sesión y escanea el QR nuevamente');
});

// Evento de desconexión
client.on('disconnected', (reason) => {
    console.log('🔌 Cliente desconectado:', reason);
    console.log('🔄 Reconectando en 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

// Evento de cambio de estado
client.on('change_state', state => {
    console.log('📱 Estado de WhatsApp:', state);
});

// Inicializar cliente con manejo de errores
client.initialize().catch(error => {
    console.error('❌ Error al inicializar WhatsApp:', error);
});

// Función para verificar si WhatsApp está listo
const isWhatsAppReady = () => {
    return client.info !== undefined;
};

// Función para formatear número boliviano
function formatPhoneNumber(numero) {
    if (!numero) return null;
    numero = numero.replace(/\D/g, '');
    if (numero.startsWith('591')) return `+${numero}`;
    if (numero.startsWith('0')) return `+591${numero.slice(1)}`;
    return `+591${numero}`;
}

// Función para enviar mensaje con mejor manejo de estado
const sendWhatsApp = async (numero, mensaje, imagePath = null) => {
    try {
        // Esperar máximo 30 segundos a que WhatsApp esté listo
        if (!client.info) {
            console.log('⏳ Esperando que WhatsApp esté listo...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout: WhatsApp no se inicializó en 30 segundos'));
                }, 30000);
                
                client.once('ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                client.once('auth_failure', (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`Auth failure: ${error}`));
                });
            });
        }
        
        const chatId = formatPhoneNumber(numero).replace('+', '') + '@c.us';

        if (imagePath) {
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(chatId, media, { caption: mensaje });
        } else {
            await client.sendMessage(chatId, mensaje);
        }
        
        console.log('✅ Mensaje enviado a', numero);
        return true;
    } catch (error) {
        console.error('❌ Error enviando WhatsApp:', error.message);
        throw error;
    }
};

// Función para obtener estado de WhatsApp
const getWhatsAppStatus = () => {
    return {
        isReady: !!client.info,
        state: client.info ? 'connected' : 'disconnected',
        sessionPath: sessionPath
    };
};

// Función para forzar reautenticación
const restartWhatsApp = () => {
    console.log('🔄 Reiniciando WhatsApp...');
    client.destroy();
    setTimeout(() => {
        client.initialize();
    }, 2000);
};

module.exports = { 
    client, 
    sendWhatsApp, 
    isWhatsAppReady, 
    getWhatsAppStatus,
    restartWhatsApp 
};