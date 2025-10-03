const db = require('../config/db');

// Obtener todos los sectores
const ObtenerSectores = (req, res) => {
  db.query('SELECT * FROM sector_sucursal', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener sectores' });
    res.json(results);
  });
};

// Obtener un sector por ID
const ObtenerSectorporId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM sector_sucursal WHERE id_sector = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el sector' });
    if (results.length === 0) return res.status(404).json({ error: 'Sector no encontrado' });
    res.json(results[0]);
  });
};

// Crear nuevo sector
const crearSector = (req, res) => {
  const { nombre, porcentaje_empresa } = req.body;

  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  if (porcentaje_empresa === undefined || isNaN(porcentaje_empresa)) {
    return res.status(400).json({ error: 'El porcentaje_empresa es requerido y debe ser numérico' });
  }

  db.query(
    'INSERT INTO sector_sucursal (nombre, porcentaje_empresa) VALUES (?, ?)',
    [nombre, porcentaje_empresa],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear sector' });
      res.status(201).json({ id: result.insertId, nombre, porcentaje_empresa });
    }
  );
};

// Actualizar sector
const actualizarSector = (req, res) => {
  const { id } = req.params;
  const { nombre, porcentaje_empresa } = req.body;

  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  if (porcentaje_empresa === undefined || isNaN(porcentaje_empresa)) {
    return res.status(400).json({ error: 'El porcentaje_empresa es requerido y debe ser numérico' });
  }

  db.query(
    'UPDATE sector_sucursal SET nombre = ?, porcentaje_empresa = ? WHERE id_sector = ?',
    [nombre, porcentaje_empresa, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar el sector' });
      res.json({ id, nombre, porcentaje_empresa });
    }
  );
};

// Eliminar sector
const eliminarSector = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM sector_sucursal WHERE id_sector = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar el sector' });
    res.json({ message: 'Sector eliminado correctamente' });
  });
};

// Obtener sucursales del mismo sector que la persona logueada
const obtenerSucursalesPorSector = async (req, res) => {
  try {
    const idPersona = req.user.id_persona; // viene del token al iniciar sesión

    // Un solo query: desde la persona → sucursal → sector → sucursales del sector
    const [sucursales] = await db.promise().query(`
  SELECT s2.*
  FROM persona p
  JOIN sucursal s1 ON p.id_sucursal = s1.id_sucursal
  JOIN sucursal s2 ON s1.id_sector = s2.id_sector
  WHERE p.id_persona = ?
`, [idPersona]);


    if (!sucursales.length) {
      return res.status(404).json({ error: "No se encontraron sucursales para este sector" });
    }

    res.json(sucursales);
  } catch (error) {
    console.error("Error al obtener sucursales por sector:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


module.exports = {
  ObtenerSectores,
  ObtenerSectorporId,
  crearSector,
  actualizarSector,
  eliminarSector,
  obtenerSucursalesPorSector
};
