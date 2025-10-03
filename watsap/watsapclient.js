const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

// Configurar ruta absoluta para la sesión
const sessionPath = path.join(__dirname, 'wwebjs_sessions');

// CREAR CARPETA DE SESIONES SI NO EXISTE (FIX CRÍTICO)
if (!fs.existsSync(sessionPath)) {
    console.log('📁 Creando carpeta de sesiones...');
    fs.mkdirSync(sessionPath, { recursive: true });
    console.log('✅ Carpeta creada en:', sessionPath);
} else {
    console.log('📁 Carpeta de sesiones ya existe:', sessionPath);
}

// Verificar permisos de la carpeta
try {
    const stats = fs.statSync(sessionPath);
    console.log('🔐 Permisos de carpeta:', stats.mode.toString(8));
} catch (error) {
    console.error('❌ Error accediendo a carpeta:', error);
}

console.log('🚀 Inicializando WhatsApp Web...');

// Crear cliente con configuración mejorada
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot",
        dataPath: sessionPath
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
            '--headless=new'
        ]
    }
});

// Variables de estado
let isAuthenticated = false;
let reconectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 3;

// Evento QR (solo se muestra si no hay sesión guardada)
client.on('qr', (qr) => {
    console.log("🔄 ESCANEA ESTE QR EN TU WHATSAPP:");
    console.log("💡 Esta sesión se guardará automáticamente");
    qrcode.generate(qr, { small: true });
    isAuthenticated = false;
});

// Evento de autenticación exitosa (CRÍTICO)
client.on('authenticated', () => {
    console.log('✅ AUTENTICACIÓN EXITOSA - Sesión guardada en:', sessionPath);
    isAuthenticated = true;
    reconectionAttempts = 0;
    
    // Verificar que se crearon los archivos de sesión
    setTimeout(() => {
        try {
            const files = fs.readdirSync(path.join(sessionPath, 'whatsapp-bot'));
            console.log('📄 Archivos de sesión creados:', files);
        } catch (error) {
            console.log('⚠️  Aún no se crearon archivos de sesión');
        }
    }, 2000);
});

// Evento listo
client.on('ready', () => {
    console.log('🚀 WHATSAPP WEB CONECTADO Y LISTO');
    console.log('👤 Usuario:', client.info.pushname);
    console.log('📱 Número:', client.info.wid.user);
    isAuthenticated = true;
});

// Manejo de errores
client.on('auth_failure', msg => {
    console.error('❌ FALLÓ AUTENTICACIÓN:', msg);
    isAuthenticated = false;
});

client.on('disconnected', (reason) => {
    console.log('🔌 DESCONECTADO:', reason);
    isAuthenticated = false;
    
    if (reconectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
        reconectionAttempts++;
        console.log(`🔄 Reconectando... Intento ${reconectionAttempts}/${MAX_RECONNECTION_ATTEMPTS}`);
        setTimeout(() => {
            client.initialize();
        }, 5000);
    } else {
        console.log('💡 Elimina la carpeta wwebjs_sessions y escanea QR nuevamente');
    }
});

// Inicializar WhatsApp
const initializeWhatsApp = async () => {
    try {
        await client.initialize();
        console.log('🔧 WhatsApp inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando WhatsApp:', error);
    }
};

// Iniciar
initializeWhatsApp();

// Función para verificar estado
const isWhatsAppReady = () => {
    return client.info !== undefined && isAuthenticated;
};

// Función para formatear número boliviano
function formatPhoneNumber(numero) {
    if (!numero) return null;
    numero = numero.replace(/\D/g, '');
    if (numero.startsWith('591')) return `+${numero}`;
    if (numero.startsWith('0')) return `+591${numero.slice(1)}`;
    return `+591${numero}`;
}

// Función para enviar mensaje
const sendWhatsApp = async (numero, mensaje, imagePath = null) => {
    try {
        if (!isWhatsAppReady()) {
            throw new Error('WhatsApp no está conectado. Espere a que se autentique.');
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

// Función para obtener estado
const getWhatsAppStatus = () => {
    return {
        isReady: isWhatsAppReady(),
        isAuthenticated: isAuthenticated,
        user: client.info ? client.info.pushname : null,
        sessionPath: sessionPath,
        folderExists: fs.existsSync(sessionPath)
    };
};

// Verificar estado periódicamente
setInterval(() => {
    if (!isWhatsAppReady()) {
        console.log('⚠️  WhatsApp desconectado. Estado:', getWhatsAppStatus());
    }
}, 30000);

module.exports = { 
    client, 
    sendWhatsApp, 
    isWhatsAppReady, 
    getWhatsAppStatus
};