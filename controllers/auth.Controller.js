const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    registrar: (req, res) => {
        const { nombre, apellido, correo, contrasena, direccion, celular, rol } = req.body;

        bcrypt.hash(contrasena, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Error al hashear contraseña', error: err });

            const sql = 'INSERT INTO usuarios (nombre, apellido, correo, contrasena, direccion, celular, rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [nombre, apellido, correo, hash, direccion || null, celular || null, rol || 'cliente'], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error al registrar usuario', error: err });
                }
                res.json({ message: 'Usuario registrado', id_usuario: result.insertId });
            });
        });
    },

    login: (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al consultar usuario', error: err });
    if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const usuario = results[0];

    bcrypt.compare(contrasena, usuario.contrasena, (err, match) => {
      if (err) return res.status(500).json({ message: 'Error al comparar contraseña', error: err });
      if (!match) return res.status(400).json({ message: 'Contraseña incorrecta' });

      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id_usuario, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        }
      });
    });
  });
}
};

module.exports = authController;