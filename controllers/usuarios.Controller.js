const db = require('../config/db');
const bcrypt = require('bcrypt');

// Obtener Todos los Usuarios actualizado para mostrar la sucursal del usuario
exports.getUsuarios = (req, res) => {
  const query = `
    SELECT 
      p.id_persona, p.nombre, p.apellido, p.ci, p.correo, p.celular, p.activo, 
      p.id_rol, p.id_sucursal, r.nombre AS rol, s.nombre AS sucursal
    FROM persona p
    LEFT JOIN rol r ON p.id_rol = r.id_rol
    LEFT JOIN sucursal s ON p.id_sucursal = s.id_sucursal
    WHERE p.id_rol IS NOT NULL;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener usuarios:", err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
};

// Crear un nuevo usuario con contraseña encriptada
exports.createUsuario = async (req, res) => {
  try {
    const {
      id_rol,
      id_sucursal = null,
      ci,
      nombre,
      apellido,
      correo = null,
      celular = null,
      contrasena = null,
      placa = null,
    } = req.body;

    // Validaciones básicas
    if (!id_rol || !ci || !nombre || !apellido) {
      return res.status(400).json({ error: "Faltan campos obligatorios básicos (rol, ci, nombre, apellido)" });
    }
    if (!/^\d{6,10}$/.test(ci)) {
      return res.status(400).json({ error: "El CI debe tener entre 6 y 10 dígitos numéricos" });
    }
    if (celular && !/^\d{8}$/.test(celular)) {
      return res.status(400).json({ error: "El celular debe tener exactamente 8 dígitos numéricos" });
    }
    if (correo && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
      return res.status(400).json({ error: "El correo no tiene un formato válido" });
    }
    if (id_rol == 2 && !id_sucursal) {
      return res.status(400).json({ error: "Las secretarias deben tener sucursal asignada" });
    }
    if ((id_rol == 1 || id_rol == 2 || id_rol == 3) && !contrasena) {
      return res.status(400).json({ error: "La contraseña es obligatoria para este rol" });
    }
    if (id_rol == 3 && !placa) {
      return res.status(400).json({ error: "Los conductores deben tener placa registrada" });
    }
    if (contrasena && !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(contrasena)) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial",
      });
    }

    // Validación de unicidad solo para campos existentes
    let checkSql = `SELECT * FROM persona WHERE ci = ?`;
    const params = [ci];

    if (correo) {
      checkSql += " OR correo = ?";
      params.push(correo);
    }
    if (placa) {
      checkSql += " OR placa = ?";
      params.push(placa);
    }

    db.query(checkSql, params, async (err, results) => {
      if (err) {
        console.error("❌ Error al verificar unicidad:", err);
        return res.status(500).json({ error: "Error interno al validar usuario" });
      }

      if (results.length > 0) {
        const duplicados = [];
        if (results.find(u => u.ci?.toString() === ci.toString())) duplicados.push("CI");
        if (correo && results.find(u => u.correo?.toString() === correo.toString())) duplicados.push("Correo");
        if (placa && results.find(u => u.placa?.toString() === placa.toString())) duplicados.push("Placa");

        return res.status(400).json({
          error: duplicados.length > 0 
            ? `Los siguientes campos ya están en uso: ${duplicados.join(", ")}`
            : "Algún dato ya existe en la base de datos",
        });
      }

      // Encriptar contraseña
      const hashedPassword = contrasena ? await bcrypt.hash(contrasena, 10) : null;

      // Insertar usuario
      const sql = `
        INSERT INTO persona 
        (id_rol, id_sucursal, ci, nombre, apellido, correo, celular, contrasena, placa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [id_rol, id_sucursal || null, ci, nombre, apellido, correo, celular, hashedPassword, placa];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Error al insertar usuario:", err);
          return res.status(500).json({ error: "Error al crear usuario" });
        }
        res.status(201).json({ message: "✅ Usuario registrado correctamente", id_persona: result.insertId });
      });
    });
  } catch (err) {
    console.error("❌ Error interno:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    ci,
    correo,
    celular,
    contrasena,
    id_rol,
    id_sucursal = null,
    id_vehiculo = null,
    activo
  } = req.body;

  try {
    // Validaciones por rol
    if (!id_rol || !ci || !nombre || !apellido) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    if (id_rol == 2 && !id_sucursal) {
      return res.status(400).json({ error: "La secretaria debe tener una sucursal asignada" });
    }

    // Obtener contraseña actual si no se envió nueva
    let hashedPassword = contrasena;

    if (contrasena && contrasena.trim() !== "") {
      hashedPassword = await bcrypt.hash(contrasena, 10);
    } else {
      const [rows] = await new Promise((resolve, reject) => {
        db.query("SELECT contrasena FROM persona WHERE id_persona = ?", [id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      hashedPassword = rows[0].contrasena;
    }

    // Actualizar datos
    const sql = `
      UPDATE persona
      SET nombre = ?, apellido = ?, ci = ?, correo = ?, celular = ?, contrasena = ?,
          id_rol = ?, id_sucursal = ?, id_vehiculo = ?, activo = ?
      WHERE id_persona = ?
    `;

    const values = [
      nombre,
      apellido,
      ci,
      correo,
      celular,
      hashedPassword,
      id_rol,
      id_sucursal || null,
      id_vehiculo || null,
      activo,
      id
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("❌ Error al actualizar usuario:", err);
        return res.status(500).json({ error: "Error al actualizar usuario" });
      }

      res.json({ message: "✅ Usuario actualizado correctamente" });
    });

  } catch (err) {
    console.error("❌ Error interno:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
// Eliminar usuario
exports.deleteUsuario = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE persona SET activo = 0 WHERE id_persona = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error al desactivar usuario:", err);
      return res.status(500).json({ error: 'Error al desactivar usuario' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: '✅ Usuario desactivado correctamente' });
  });
};
// Activar o desactivar un usuario
exports.toggleActivo = (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const query = `UPDATE persona SET activo = ? WHERE id_persona = ?`;
  db.query(query, [activo, id], (err) => {
    if (err) {
      console.error("❌ Error al actualizar estado:", err);
      return res.status(500).json({ error: "Error al actualizar estado" });
    }
    res.json({ message: "✅ Estado actualizado correctamente" });
  });
};
// GET /api/conductores
exports.getConductores = (req, res) => {
  const query = `
    SELECT id_persona, nombre, apellido 
    FROM persona 
    WHERE id_rol = 3 AND activo = 1
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener conductores:", err);
      return res.status(500).json({ error: 'Error al obtener conductores' });
    }
    res.json(results);
  });
};

exports.getSecretarias = (req, res) => {
  const query = `
    SELECT id_persona, nombre, apellido 
    FROM persona 
    WHERE id_rol = 2 AND activo = 1
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener secretarias:", err);
      return res.status(500).json({ error: 'Error al obtener secretarias' });
    }
    res.json(results);
  });
};

// GET /api/usuarios/ci/:ci
exports.obtenerPersonaPorCI = async (req, res) => {
  const { ci } = req.params;

  try {
    const [rows] = await db.promise().query(
      'SELECT id_persona, nombre, apellido, correo, celular FROM persona WHERE ci = ?',
      [ci]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al buscar persona por CI:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
