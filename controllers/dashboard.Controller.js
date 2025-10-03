const db = require('../config/db');

const obtenerEstadisticas = (req, res) => {
  const queries = {
    totalEncomiendas: 'SELECT COUNT(*) AS totalEncomiendas FROM encomienda',
    encomiendasUltimos7Dias: `SELECT COUNT(*) AS encomiendasUltimos7Dias FROM encomienda WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    totalManifiestos: 'SELECT COUNT(*) AS totalManifiestos FROM manifiesto',
    totalSucursales: 'SELECT COUNT(*) AS totalSucursales FROM sucursal',
    encomiendasPorSucursalOrigen: `
      SELECT s.nombre AS sucursal, COUNT(e.id_encomienda) AS total
      FROM encomienda e
      JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
      GROUP BY s.nombre
    `,
    encomiendasPorSucursalDestino: `
      SELECT s.nombre AS sucursal, COUNT(e.id_encomienda) AS total
      FROM encomienda e
      JOIN sucursal s ON e.id_sucursal_destino = s.id_sucursal
      GROUP BY s.nombre
    `,
    encomiendasPorEstado: `
      SELECT estado_actual, COUNT(*) AS total
      FROM encomienda
      GROUP BY estado_actual
    `
  };

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(queries.totalEncomiendas, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].totalEncomiendas);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.encomiendasUltimos7Dias, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].encomiendasUltimos7Dias);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalManifiestos, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].totalManifiestos);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalSucursales, (err, result) => {
        if (err) reject(err);
        else resolve(result[0].totalSucursales);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.encomiendasPorSucursalOrigen, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.encomiendasPorSucursalDestino, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.encomiendasPorEstado, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
  ])
  .then(([
    totalEncomiendas,
    encomiendasUltimos7Dias,
    totalManifiestos,
    totalSucursales,
    encomiendasPorSucursalOrigen,
    encomiendasPorSucursalDestino,
    encomiendasPorEstado
  ]) => {
    res.json({
      totalEncomiendas,
      encomiendasUltimos7Dias,
      totalManifiestos,
      totalSucursales,
      encomiendasPorSucursalOrigen,
      encomiendasPorSucursalDestino,
      encomiendasPorEstado
    });
  })
  .catch((error) => {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  });
};

const getDashboardSecretaria = async (req, res) => {
  const id_secretaria = req.user.id_persona;

  try {
    // Obtener sucursal + sector de la secretaria
    const [[sucursal]] = await db.promise().query(
      `SELECT s.nombre, s.ubicacion, sec.nombre AS sector
       FROM persona p
       JOIN sucursal s ON p.id_sucursal = s.id_sucursal
       LEFT JOIN sector_sucursal sec ON s.id_sector = sec.id_sector
       WHERE p.id_persona = ?`,
      [id_secretaria]
    );

    // Totales básicos
    const [[{ total_encomiendas }]] = await db.promise().query(
      `SELECT COUNT(*) AS total_encomiendas FROM encomienda WHERE id_secretaria = ?`,
      [id_secretaria]
    );

    const [[{ total_hoy }]] = await db.promise().query(
      `SELECT COUNT(*) AS total_hoy FROM encomienda WHERE id_secretaria = ? AND DATE(fecha) = CURDATE()`,
      [id_secretaria]
    );

    const [[{ total_recaudado }]] = await db.promise().query(
      `SELECT COALESCE(SUM(monto_empresa),0) AS total_recaudado FROM encomienda WHERE id_secretaria = ?`,
      [id_secretaria]
    );

    const [[{ total_manifiestos }]] = await db.promise().query(
      `SELECT COUNT(*) AS total_manifiestos FROM manifiesto WHERE id_secretaria = ?`,
      [id_secretaria]
    );

    // Encomiendas por estado para la secretaria
    const [encomiendasPorEstado] = await db.promise().query(
      `SELECT estado_actual, COUNT(*) AS cantidad
       FROM encomienda
       WHERE id_secretaria = ?
       GROUP BY estado_actual`,
      [id_secretaria]
    );

    // Encomiendas por día últimos 7 días filtradas por secretaria
   const [encomiendasPorDia] = await db.promise().query(
    `WITH RECURSIVE fechas AS (
     SELECT CURDATE() AS dia
     UNION ALL
     SELECT dia - INTERVAL 1 DAY FROM fechas WHERE dia > DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     )
    SELECT
     fechas.dia,
     COUNT(e.id_encomienda) AS cantidad
    FROM fechas
    LEFT JOIN encomienda e ON DATE(e.fecha) = fechas.dia AND e.id_secretaria = ?
    GROUP BY fechas.dia
    ORDER BY fechas.dia`,
    [id_secretaria]
    );

    // Distribución por sucursal destino
    const [encomiendasPorSucursalDestino] = await db.promise().query(
      `SELECT s.nombre AS sucursal_destino, COUNT(*) AS cantidad
       FROM encomienda e
       JOIN sucursal s ON e.id_sucursal_destino = s.id_sucursal
       WHERE e.id_secretaria = ?
       GROUP BY s.nombre
       ORDER BY cantidad DESC`,
      [id_secretaria]
    );
    // Respuesta consolidada
    res.json({
      sucursal,
      total_encomiendas,
      total_hoy,
      total_recaudado: total_recaudado || 0,
      total_manifiestos,
      encomiendasPorEstado,
      encomiendasPorDia,
      encomiendasPorSucursalDestino,
    });

  } catch (error) {
    console.error('❌ Error al obtener dashboard secretaria:', error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

const getDashboardConductor = async (req, res) => {
  const id_conductor = req.user.id_persona;

  try {
    // Total encomiendas asignadas al conductor (en estados asignado, tránsito o entregado)
    const [[{ total_asignadas }]] = await db.promise().query(
      `SELECT COUNT(*) AS total_asignadas
       FROM encomienda
       WHERE id_conductor = ? AND estado_actual IN ('ASIGNADO A CONDUCTOR', 'EN TRÁNSITO', 'ENTREGADO')`,
      [id_conductor]
    );

    // Encomiendas en tránsito
    const [[{ en_transito }]] = await db.promise().query(
      `SELECT COUNT(*) AS en_transito
       FROM encomienda
       WHERE id_conductor = ? AND estado_actual = 'EN TRÁNSITO'`,
      [id_conductor]
    );

    // Encomiendas entregadas
    const [[{ entregadas }]] = await db.promise().query(
      `SELECT COUNT(*) AS entregadas
       FROM encomienda
       WHERE id_conductor = ? AND estado_actual = 'ENTREGADO'`,
      [id_conductor]
    );

    // Manifiestos asignados
    const [[{ total_manifiestos }]] = await db.promise().query(
      `SELECT COUNT(*) AS total_manifiestos
       FROM manifiesto
       WHERE id_conductor = ?`,
      [id_conductor]
    );

    // Recaudación total para conductor
    const [[{ total_recaudado }]] = await db.promise().query(
      `SELECT COALESCE(SUM(monto_conductor), 0) AS total_recaudado
       FROM encomienda
       WHERE id_conductor = ?`,
      [id_conductor]
    );

    // Encomiendas por día últimos 7 días (fecha y conteo)
    const [encomiendasPorDia] = await db.promise().query(
    `WITH RECURSIVE fechas AS (
      SELECT CURDATE() AS dia
      UNION ALL
      SELECT dia - INTERVAL 1 DAY FROM fechas WHERE dia > DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    )
    SELECT
      fechas.dia,
      COUNT(e.id_encomienda) AS cantidad
    FROM fechas
    LEFT JOIN encomienda e ON DATE(e.fecha) = fechas.dia AND e.id_conductor = ?
    GROUP BY fechas.dia
    ORDER BY fechas.dia`,
    [id_conductor]
    );


    res.json({
      total_asignadas,
      en_transito,
      entregadas,
      total_manifiestos,
      total_recaudado,
      encomiendasPorDia
    });

  } catch (error) {
    console.error('Error en dashboard conductor:', error);
    res.status(500).json({ error: 'Error obteniendo datos para dashboard conductor' });
  }
};

module.exports = { 
    obtenerEstadisticas,
    getDashboardSecretaria,
    getDashboardConductor

 };
