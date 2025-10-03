require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware, requireRole } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/auth.Routes');
const userRoutes = require('./routes/usuarios.Routes');
const sucursalRoutes = require('./routes/sucursal.Routes');
const rolesRoutes = require('./routes/roles.Routes');
const dashboardRoutes = require('./routes/dashboard.Routes');
const encomiendaRoutes = require('./routes/encomienda.Routes');
const publicRoutes = require('./routes/public.Routes'); 
const sectorRoutes = require('./routes/sector.Routes'); 
const manifiestoRoutes = require('./routes/manifiestos.Routes');
const reportesRoutes = require('./routes/reportes.Routes');
const path = require('path');

const app = express();

// ⚡ Configuración CORS para permitir solo tu frontend ngrok
const corsOptions = {
  origin: ['https://entrerios.jhoelvillarroel.com',
    'http://localhost:5173'  // <-- tu frontend local
  ], // reemplaza con tu frontend ngrok
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));  // <-- usa corsOptions aquí
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/encomiendas', authMiddleware, encomiendaRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/manifiestos', manifiestoRoutes);
app.use("/api/reportes", reportesRoutes);

// Archivos estáticos
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
