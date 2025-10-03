const db = require('../config/db');

// Obtener todas las sucursales
exports.getSucursales = (req, res) => {
  db.query('SELECT * FROM sucursal', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener sucursales' });
    res.json(results);
  });
};

// Obtener una sucursal por ID
exports.getSucursalById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM sucursal WHERE id_sucursal = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la sucursal' });
    if (results.length === 0) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(results[0]);
  });
};

// Crear nueva sucursal
exports.createSucursal = (req, res) => {
  const { nombre, ubicacion, id_sector } = req.body;

  if (!nombre || !id_sector) {
    return res.status(400).json({ error: 'Nombre e id_sector son requeridos' });
  }

  db.query(
    'INSERT INTO sucursal (nombre, ubicacion, id_sector) VALUES (?, ?, ?)',
    [nombre, ubicacion || null, id_sector],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear la sucursal' });
      res.status(201).json({ id: result.insertId, nombre, ubicacion, id_sector });
    }
  );
};


// Actualizar sucursal
exports.updateSucursal = (req, res) => {
  const { id } = req.params;
  const { nombre, ubicacion, id_sector } = req.body;

  if (!nombre || !id_sector) {
    return res.status(400).json({ error: 'Nombre e id_sector son requeridos' });
  }

  db.query(
    'UPDATE sucursal SET nombre = ?, ubicacion = ?, id_sector = ? WHERE id_sucursal = ?',
    [nombre, ubicacion || null, id_sector, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar la sucursal' });
      res.json({ id, nombre, ubicacion, id_sector });
    }
  );
};

// Eliminar sucursal
exports.deleteSucursal = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM sucursal WHERE id_sucursal = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar la sucursal' });
    res.json({ message: 'Sucursal eliminada correctamente' });
  });
};

exports.getSucursalesDestino = (req, res) => {
  const { id_sucursal, rol } = req.user;

  if (rol !== 2) {
    return res.status(403).json({ error: 'Solo secretarias pueden ver sucursales de su sector' });
  }

  
  const sqlSector = 'SELECT id_sector FROM sucursal WHERE id_sucursal = ?';
  db.query(sqlSector, [id_sucursal], (err, sectorResult) => {
    if (err) return res.status(500).json({ error: 'Error al consultar el sector' });

    if (!sectorResult || sectorResult.length === 0) {
      return res.status(404).json({ error: 'Sucursal de la secretaria no encontrada' });
    }

    const id_sector = sectorResult[0].id_sector;

    const sqlSucursales = `
      SELECT id_sucursal, nombre 
      FROM sucursal 
      WHERE id_sector = ? AND id_sucursal != ?
    `;
    db.query(sqlSucursales, [id_sector, id_sucursal], (err, sucursales) => {
      if (err) return res.status(500).json({ error: 'Error al obtener sucursales' });
      res.json(sucursales);
    });
  });
};


