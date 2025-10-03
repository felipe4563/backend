const db = require('../config/db');

// Middleware de verificación de admin
const verificarAdmin = (req, res) => {
  const rol = req.user?.rol;
  if (rol !== 1) {
    res.status(403).json({ error: "Acceso denegado. Solo administradores pueden acceder." });
    return false;
  }
  return true;
};

// 1. Encomiendas por rango de fechas
const reportePorRangoFechas = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const { fecha_inicio, fecha_fin } = req.query;
  const params = [];
  let sql = `
    SELECT COUNT(*) AS total_encomiendas,
           SUM(tarifa) AS total_recaudado
    FROM encomienda
    WHERE 1=1
  `;
  if (fecha_inicio && fecha_fin) {
    sql += ` AND fecha BETWEEN ? AND ?`;
    params.push(fecha_inicio, fecha_fin);
  }

  try {
    const [rows] = await db.promise().query(sql, params);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reporte por rango de fechas" });
  }
};

// 2. Encomiendas por secretaria
const reportePorSecretaria = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const sql = `
    SELECT p.nombre, p.apellido, COUNT(*) AS total_registradas
    FROM encomienda e
    JOIN persona p ON e.id_secretaria = p.id_persona
    GROUP BY p.id_persona
  `;
  try {
    const [rows] = await db.promise().query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reporte por secretaria" });
  }
};

// 3. Encomiendas por sucursal origen
const reportePorSucursal = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const sql = `
    SELECT s.nombre AS sucursal, COUNT(*) AS total_encomiendas
    FROM encomienda e
    JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
    GROUP BY s.id_sucursal
  `;
  try {
    const [rows] = await db.promise().query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reporte por sucursal" });
  }
};

// 4. Encomiendas por conductor
const reportePorConductor = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const sql = `
    SELECT p.nombre, p.apellido,
           COUNT(*) AS total_asignadas,
           SUM(monto_conductor) AS ganancia
    FROM encomienda e
    JOIN persona p ON e.id_conductor = p.id_persona
    GROUP BY p.id_persona
  `;
  try {
    const [rows] = await db.promise().query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reporte por conductor" });
  }
};

// 5. Monto empresa por sucursal
const montoEmpresaPorSucursal = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const sql = `
    SELECT s.nombre AS sucursal, SUM(monto_empresa) AS total_empresa
    FROM encomienda e
    JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
    GROUP BY s.id_sucursal
  `;
  try {
    const [rows] = await db.promise().query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener monto empresa por sucursal" });
  }
};

const encomiendas = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const { 
    fecha_inicio, 
    fecha_fin, 
    id_secretaria, 
    id_conductor, 
    id_sucursal_origen, 
    id_sucursal_destino,
    estado_actual   // 👈 nuevo parámetro
  } = req.query;

  const params = [];
  let sql = `
    SELECT e.*, 
           s.nombre AS sucursal_origen,
           s2.nombre AS sucursal_destino,
           CONCAT(ps.nombre, ' ', ps.apellido) AS secretaria_nombre,
           CONCAT(pc.nombre, ' ', pc.apellido) AS conductor_nombre
    FROM encomienda e
    LEFT JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
    LEFT JOIN sucursal s2 ON e.id_sucursal_destino = s2.id_sucursal
    LEFT JOIN persona ps ON e.id_secretaria = ps.id_persona
    LEFT JOIN persona pc ON e.id_conductor = pc.id_persona
    WHERE 1=1
  `;

  // 🔹 Filtros dinámicos
  if (fecha_inicio && fecha_fin) {
    sql += " AND e.fecha >= ? AND e.fecha < DATE_ADD(?, INTERVAL 1 DAY)";
    params.push(fecha_inicio + " 00:00:00", fecha_fin + " 00:00:00");
  }
  if (id_secretaria) {
    sql += " AND e.id_secretaria = ?";
    params.push(id_secretaria);
  }
  if (id_conductor) {
    sql += " AND e.id_conductor = ?";
    params.push(id_conductor);
  }
  if (id_sucursal_origen) {
    sql += " AND e.id_sucursal_origen = ?";
    params.push(id_sucursal_origen);
  }
  if (id_sucursal_destino) {
    sql += " AND e.id_sucursal_destino = ?";
    params.push(id_sucursal_destino);
  }
  if (estado_actual) {  
    sql += " AND e.estado_actual = ?";
    params.push(estado_actual);
  }

  try {
    const [rows] = await db.promise().query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener encomiendas filtradas" });
  }
};



// controllers/reportes.Controller.js
const resumenSucursales = async (req, res) => {
  if (!verificarAdmin(req, res)) return;

  const { id_sector, fecha_inicio, fecha_fin } = req.query;
  const params = [];
  let sql = `
    SELECT 
      sec.nombre AS sector,
      s.nombre AS sucursal,
      SUM(e.monto_empresa) AS total_monto_empresa
    FROM encomienda e
    LEFT JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
    LEFT JOIN sector_sucursal sec ON s.id_sector = sec.id_sector
    WHERE 1=1
  `;

  // Filtro de fechas (cuando fue registrada la encomienda)
  if (fecha_inicio && fecha_fin) {
    sql += " AND DATE(e.fecha_registro) BETWEEN ? AND ?";
    params.push(fecha_inicio, fecha_fin);
  }

  // Filtro por sector específico
  if (id_sector) {
    sql += " AND sec.id_sector = ?";
    params.push(id_sector);
  }

  sql += `
    GROUP BY sec.nombre, s.nombre
    ORDER BY sec.nombre, s.nombre
  `;

  try {
    const [rows] = await db.promise().query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener resumen por sucursales" });
  }
};

const getReporteEncomiendasSecretaria = (req, res) => {
  const { id_persona, id_sucursal, rol } = req.user;

  if (rol !== 2) {
    return res.status(403).json({ error: 'Solo secretarias pueden generar reportes' });
  }

  // Obtener filtros de query params
  const { fechaInicio, fechaFin, estado } = req.query;

  // Construir la consulta base
  let sql = `
    SELECT 
      e.numero_guia,
      e.descripcion,
      e.estado_actual,
      e.monto_empresa,
      s.nombre AS sucursal,
      sec.nombre AS sector
    FROM encomienda e
    JOIN sucursal s ON e.id_sucursal_origen = s.id_sucursal
    JOIN sector_sucursal sec ON s.id_sector = sec.id_sector
    WHERE e.id_sucursal_origen = ? AND e.id_secretaria = ?
  `;

  const params = [id_sucursal, id_persona];

  // Filtros adicionales
  if (fechaInicio && fechaFin) {
    sql += " AND e.fecha BETWEEN ? AND ?";
    params.push(fechaInicio, fechaFin);
  } else if (fechaInicio) {
    sql += " AND e.fecha >= ?";
    params.push(fechaInicio);
  } else if (fechaFin) {
    sql += " AND e.fecha <= ?";
    params.push(fechaFin);
  }

  if (estado) {
    sql += " AND e.estado_actual = ?";
    params.push(estado);
  }

  sql += " ORDER BY e.fecha DESC";

  db.query(sql, params, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!resultados.length) {
      return res.status(404).json({ error: 'No se encontraron encomiendas registradas por esta secretaria' });
    }

    // Sumar el monto_empresa correctamente
    const totalMontoEmpresa = resultados.reduce(
      (acc, row) => acc + parseFloat(row.monto_empresa || 0),
      0
    );

    res.json({
      sucursal: resultados[0].sucursal,
      sector: resultados[0].sector,
      secretaria: id_persona,
      total_monto_empresa: totalMontoEmpresa,
      cantidad_encomiendas: resultados.length,
      data: resultados.map((row) => ({
        numero_guia: row.numero_guia,
        descripcion: row.descripcion,
        estado_actual: row.estado_actual,
        monto_empresa: parseFloat(row.monto_empresa || 0),
      })),
    });
  });
};

const getReporteManifiestosConductor = (req, res) => {
  const { id_persona, rol } = req.user;

  // Validar que sea conductor
  if (rol !== 3) { // ⚠️ Asegúrate que el rol de conductor sea 3 en tu tabla rol
    return res.status(403).json({ error: 'Solo conductores pueden generar este reporte' });
  }

  // Filtros de query
  const { fechaInicio, fechaFin, estado } = req.query;

  let sql = `
    SELECT 
      m.id_manifiesto,
      m.numero_manifiesto,
      m.fecha AS fecha_manifiesto,
      m.estado AS estado_manifiesto,
      e.numero_guia,
      e.descripcion,
      e.monto_conductor,
      e.estado_actual
    FROM manifiesto m
    JOIN manifiesto_encomienda me ON m.id_manifiesto = me.id_manifiesto
    JOIN encomienda e ON me.id_encomienda = e.id_encomienda
    WHERE m.id_conductor = ?
  `;

  const params = [id_persona];

  // Filtros por fecha del manifiesto
  if (fechaInicio && fechaFin) {
    sql += " AND m.fecha BETWEEN ? AND ?";
    params.push(fechaInicio, fechaFin);
  } else if (fechaInicio) {
    sql += " AND m.fecha >= ?";
    params.push(fechaInicio);
  } else if (fechaFin) {
    sql += " AND m.fecha <= ?";
    params.push(fechaFin);
  }

  // Filtro por estado del manifiesto
  if (estado) {
    sql += " AND m.estado = ?";
    params.push(estado);
  }

  sql += " ORDER BY m.fecha DESC";

  db.query(sql, params, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!resultados.length) {
      return res.status(404).json({ error: 'No se encontraron manifiestos para este conductor' });
    }

    // Agrupar por manifiesto
    const manifiestos = {};
    let totalGeneral = 0;
    let totalEncomiendas = 0;

    resultados.forEach(row => {
      if (!manifiestos[row.id_manifiesto]) {
        manifiestos[row.id_manifiesto] = {
          id_manifiesto: row.id_manifiesto,
          numero_manifiesto: row.numero_manifiesto,
          fecha: row.fecha_manifiesto,
          estado: row.estado_manifiesto,
          encomiendas: [],
          total_monto_conductor: 0
        };
      }

      manifiestos[row.id_manifiesto].encomiendas.push({
        numero_guia: row.numero_guia,
        descripcion: row.descripcion,
        estado_actual: row.estado_actual,
        monto_conductor: row.monto_conductor
      });

      manifiestos[row.id_manifiesto].total_monto_conductor += parseFloat(row.monto_conductor || 0);
      totalGeneral += parseFloat(row.monto_conductor || 0);
      totalEncomiendas++;
    });

    res.json({
      conductor: id_persona,
      total_general_conductor: totalGeneral,
      total_encomiendas: totalEncomiendas,
      manifiestos: Object.values(manifiestos)
    });
  });
};


module.exports = {
  reportePorRangoFechas,
  reportePorSecretaria,
  reportePorSucursal,
  reportePorConductor,
  montoEmpresaPorSucursal,
  encomiendas,
  resumenSucursales,
  getReporteEncomiendasSecretaria,
  getReporteManifiestosConductor
};
