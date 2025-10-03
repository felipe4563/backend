const db = require('../config/db');

// Obtener todos los roles
const obtenerRoles = (req, res) => {
  const sql = 'SELECT * FROM rol';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener roles:', err);
      return res.status(500).json({ error: 'Error al obtener roles' });
    }
    res.json(result);
  });
};

// Crear un nuevo rol
const crearRol = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

  const sql = 'INSERT INTO rol (nombre) VALUES (?)';
  db.query(sql, [nombre], (err, result) => {
    if (err) {
      console.error('Error al crear rol:', err);
      return res.status(500).json({ error: 'Error al crear rol' });
    }
    res.status(201).json({ message: 'Rol creado exitosamente', id_rol: result.insertId });
  });
};

// Actualizar un rol
const actualizarRol = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

  const sql = 'UPDATE rol SET nombre = ? WHERE id_rol = ?';
  db.query(sql, [nombre, id], (err) => {
    if (err) {
      console.error('Error al actualizar rol:', err);
      return res.status(500).json({ error: 'Error al actualizar rol' });
    }
    res.json({ message: 'Rol actualizado exitosamente' });
  });
};

// Eliminar un rol
const eliminarRol = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM rol WHERE id_rol = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error al eliminar rol:', err);
      return res.status(500).json({ error: 'Error al eliminar rol' });
    }
    res.json({ message: 'Rol eliminado exitosamente' });
  });
};

module.exports = {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
};
