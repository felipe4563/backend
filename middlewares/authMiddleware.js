const jwt = require('jsonwebtoken');

/**
 * Middleware base de autenticación: verifica token y agrega req.user
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const { id_persona, rol, id_sucursal } = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    req.user = { id_persona, rol, id_sucursal }; // rol es un número: 1 = admin, 2 = secretaria, 3 = conductor
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware de autorización por rol (uno o varios)
 * @param {number|number[]} rolesPermitidos - Rol o array de roles permitidos
 */
const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
    }

    next();
  };
};

// Exportamos ambos
module.exports = {
  authMiddleware,
  requireRole
};
