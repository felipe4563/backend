const db = require('../config/db');

/**
 * Obtener los datos públicos de una encomienda por número de guía
 */
const getEncomiendaPorNumeroGuia = async (req, res) => {
  const { numero_guia } = req.params;

  try {
    const [rows] = await db.promise().query(`
      SELECT 
        e.numero_guia,
        e.fecha,
        e.descripcion,
        e.valor_declarado,
        e.tarifa,
        e.estado_actual,
        s_origen.nombre AS sucursal_origen,
        s_destino.nombre AS sucursal_destino
      FROM encomienda e
      LEFT JOIN sucursal s_origen ON e.id_sucursal_origen = s_origen.id_sucursal
      LEFT JOIN sucursal s_destino ON e.id_sucursal_destino = s_destino.id_sucursal
      WHERE e.numero_guia = ?
    `, [numero_guia]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Encomienda no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error al buscar encomienda pública:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEncomiendaPorNumeroGuia
};
