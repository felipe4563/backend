const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendWhatsApp } = require('../watsap/watsapclient');

function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

const asignarEncomiendas = async (req, res) => {
  const { encomiendas: encomiendaIds, id_conductor } = req.body;
  if (!Array.isArray(encomiendaIds) || encomiendaIds.length === 0 || !id_conductor) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const numero_manifiesto = `MANI-${uuidv4().slice(0, 8).toUpperCase()}`;
  const fecha = new Date();
  let manifiestoData = [];

  try {
    // 1️⃣ Actualizar encomiendas y agregar historial
    for (const id of encomiendaIds) {
      await db.promise().query(
        `UPDATE encomienda SET id_conductor = ?, estado_actual = 'ASIGNADO A CONDUCTOR' WHERE id_encomienda = ?`,
        [id_conductor, id]
      );

      await db.promise().query(
        `INSERT INTO historial_estado (id_encomienda, estado, fecha, registrado_por) VALUES (?, ?, ?, ?)`,
        [id, 'ASIGNADO A CONDUCTOR', fecha, req.user.id_persona]
      );

      // Obtener datos para enviar mensaje
      const [[encomienda]] = await db.promise().query(
        `SELECT e.id_encomienda, e.numero_guia, 
                p.nombre AS remitente_nombre, p.celular AS remitente_celular,
                c.nombre AS consignatario_nombre, c.celular AS consignatario_celular
         FROM encomienda e
         JOIN persona p ON e.id_remitente = p.id_persona
         JOIN persona c ON e.id_consignatorio = c.id_persona
         WHERE e.id_encomienda = ?`,
        [id]
      );

      manifiestoData.push(encomienda);

      // Construir mensaje dinámico
      const mensaje = `
${obtenerSaludo()} 👋

La encomienda *${encomienda.numero_guia}* ya fue asignada a un conductor.
Pronto será entregada a su destino.

¡Gracias por usar nuestro servicio!
      `;

      // Enviar WhatsApp al remitente y consignatario
      await sendWhatsApp(encomienda.remitente_celular, `Hola ${encomienda.remitente_nombre}, ${mensaje}`);
      await sendWhatsApp(encomienda.consignatario_celular, `Hola ${encomienda.consignatario_nombre}, ${mensaje}`);
    }

    // 2️⃣ Insertar manifiesto
    const [result] = await db.promise().query(
      `INSERT INTO manifiesto (numero_manifiesto, id_conductor, fecha, id_secretaria, estado) VALUES (?, ?, ?, ?, ?)`,
      [numero_manifiesto, id_conductor, fecha, req.user.id_persona, 'ASIGNADO']
    );

    const id_manifiesto = result.insertId;

    // 3️⃣ Insertar relaciones en manifiesto_encomienda
    for (const encomienda of manifiestoData) {
      await db.promise().query(
        `INSERT INTO manifiesto_encomienda (id_manifiesto, id_encomienda) VALUES (?, ?)`,
        [id_manifiesto, encomienda.id_encomienda]
      );
    }

    // 4️⃣ Respuesta final
    res.status(200).json({
      message: '✅ Encomiendas asignadas correctamente',
      numero_manifiesto,
      conductor_asignado: id_conductor,
      fecha: fecha.toISOString(),
      encomiendas: manifiestoData.map(e => ({
        numero_guia: e.numero_guia,
        remitente: e.remitente_nombre,
        consignatario: e.consignatario_nombre
      }))
    });

  } catch (error) {
    console.error('❌ Error al asignar encomiendas:', error);
    res.status(500).json({ error: 'Error al asignar encomiendas' });
  }
};

const getManifiestosSecretaria = async (req, res) => {
  try {
    const idSecretaria = req.user.id_persona;

    // 1. Obtener la sucursal de la secretaria logueada
    const [[secretaria]] = await db.promise().query(
      `SELECT id_sucursal FROM persona WHERE id_persona = ?`,
      [idSecretaria]
    );
    if (!secretaria) return res.status(404).json({ error: "Secretaria no encontrada" });

    const idSucursal = secretaria.id_sucursal;

    // 2. Obtener los ids de todas las secretarias que pertenecen a esa sucursal
    const [secretariasEnSucursal] = await db.promise().query(
      `SELECT id_persona FROM persona WHERE id_sucursal = ? AND id_rol = 2`,
      [idSucursal]
    );

    const idsSecretarias = secretariasEnSucursal.map(s => s.id_persona);
    if (idsSecretarias.length === 0) return res.json([]); // si no hay secretarias, no hay manifiestos

    // 3. Obtener los manifiestos de esas secretarias
    const [manifiestos] = await db.promise().query(
      `SELECT m.id_manifiesto, m.numero_manifiesto, m.fecha, 
          CONCAT(c.nombre, ' ', c.apellido) AS nombre_conductor, m.id_secretaria
       FROM manifiesto m
       JOIN persona c ON m.id_conductor = c.id_persona
       WHERE m.id_secretaria IN (?)`,
      [idsSecretarias]
    );

    // 4. Añadir las encomiendas a cada manifiesto
    for (const manifiesto of manifiestos) {
      const [encomiendas] = await db.promise().query(
        `SELECT e.id_encomienda, e.numero_guia
         FROM manifiesto_encomienda me
         JOIN encomienda e ON me.id_encomienda = e.id_encomienda
         WHERE me.id_manifiesto = ?`,
        [manifiesto.id_manifiesto]
      );
      manifiesto.encomiendas = encomiendas;
    }

    res.json(manifiestos);
  } catch (error) {
    console.error("Error al obtener manifiestos:", error);
    res.status(500).json({ error: "Error al obtener manifiestos" });
  }
};

const getManifiestosConductor = async (req, res) => {
  try {
    const idConductor = req.user.id_persona;

    // Traer manifiestos solo del conductor logueado
    const [manifiestos] = await db.promise().query(
      `SELECT m.id_manifiesto, m.numero_manifiesto, m.fecha,
              m.estado,
              CONCAT(s.nombre, ' ', s.apellido) AS nombre_secretaria, 
              m.id_conductor
       FROM manifiesto m
       JOIN persona s ON m.id_secretaria = s.id_persona
       WHERE m.id_conductor = ?`,
      [idConductor]
    );

    for (const manifiesto of manifiestos) {
      const [encomiendas] = await db.promise().query(
        `SELECT e.id_encomienda, e.numero_guia, e.estado_actual
         FROM manifiesto_encomienda me
         JOIN encomienda e ON me.id_encomienda = e.id_encomienda
         WHERE me.id_manifiesto = ?`,
        [manifiesto.id_manifiesto]
      );
      manifiesto.encomiendas = encomiendas;
    }

    res.json(manifiestos);
  } catch (error) {
    console.error("Error al obtener manifiestos del conductor:", error);
    res.status(500).json({ error: "Error al obtener manifiestos" });
  }
};



const getManifiestoDetalle = (req, res) => {
  const id = req.params.id;

  const sqlManifiesto = 
    `SELECT m.numero_manifiesto, m.fecha, p.nombre AS nombre_conductor
    FROM manifiesto m
    JOIN persona p ON p.id_persona = m.id_conductor
    WHERE m.id_manifiesto = ?`;

  const sqlEncomiendas = 
    `SELECT e.numero_guia, so.nombre AS origen, sd.nombre AS destino, e.descripcion, e.valor_declarado
    FROM manifiesto_encomienda me
    JOIN encomienda e ON me.id_encomienda = e.id_encomienda
    JOIN sucursal so ON so.id_sucursal = e.id_sucursal_origen
    JOIN sucursal sd ON sd.id_sucursal = e.id_sucursal_destino
    WHERE me.id_manifiesto = ?`;

  db.query(sqlManifiesto, [id], (err, manifiestoResult) => {
    if (err) return res.status(500).json({ error: err.message });

    if (manifiestoResult.length === 0) {
      return res.status(404).json({ error: 'Manifiesto no encontrado' });
    }

    db.query(sqlEncomiendas, [id], (err, encomiendasResult) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.json({
        manifiesto: manifiestoResult[0],
        encomiendas: encomiendasResult,
      });
    });
  });
};

const listarEncomiendasDeManifiesto = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT e.id_encomienda, e.numero_guia, e.descripcion, e.estado_actual,
           so.nombre AS origen, sd.nombre AS destino
    FROM manifiesto_encomienda me
    JOIN encomienda e ON me.id_encomienda = e.id_encomienda
    JOIN sucursal so ON e.id_sucursal_origen = so.id_sucursal
    JOIN sucursal sd ON e.id_sucursal_destino = sd.id_sucursal
    WHERE me.id_manifiesto = ?;
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener encomiendas', error: err });
    res.json(results);
  });
};

const recibirEncomienda = (req, res) => {
  const { id } = req.params;
  const id_secretaria = req.user.id_persona;

  const sqlUpdate = `
    UPDATE encomienda
    SET estado_actual = 'EN OFICINAS DE DESTINO'
    WHERE id_encomienda = ? AND estado_actual = 'EN TRÁNSITO';
  `;
  db.query(sqlUpdate, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar encomienda', error: err });
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo recibir. Estado no válido o encomienda inexistente.' });
    }
    const sqlHistorial = `
      INSERT INTO historial_estado (id_encomienda, estado, fecha, registrado_por)
      VALUES (?, 'EN OFICINAS DE DESTINO', NOW(), ?);
    `;
    db.query(sqlHistorial, [id, id_secretaria], (err) => {
      if (err) return res.status(500).json({ message: 'Error al registrar historial', error: err });
      res.json({ message: 'Encomienda recibida correctamente', id_encomienda: id });
    });
  });
};
const recibirTodasDelManifiesto = (req, res) => {
  const { ids_encomiendas } = req.body;
  const id_secretaria = req.user.id_persona;

  if (!Array.isArray(ids_encomiendas) || ids_encomiendas.length === 0) {
    return res.status(400).json({ message: 'No se enviaron encomiendas para recibir' });
  }

  const sqlUpdate = `
    UPDATE encomienda
    SET estado_actual = 'EN OFICINAS DE DESTINO'
    WHERE id_encomienda IN (?) AND estado_actual = 'EN TRÁNSITO';
  `;
  db.query(sqlUpdate, [ids_encomiendas], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar encomiendas', error: err });

    const sqlHistorial = `
      INSERT INTO historial_estado (id_encomienda, estado, fecha, registrado_por)
      VALUES ?;
    `;
    const historialValues = ids_encomiendas.map(idEnc => [idEnc, 'EN OFICINAS DE DESTINO', new Date(), id_secretaria]);

    db.query(sqlHistorial, [historialValues], (err) => {
      if (err) return res.status(500).json({ message: 'Error al registrar historial', error: err });
      res.json({ message: `Se recibieron ${result.affectedRows} encomiendas del manifiesto.` });
    });
  });
};


const getManifiestosConductorPersistentes = (req, res) => {
    // 1️⃣ Verificamos que el usuario esté definido
    if (!req.user || !req.user.id_persona) {
        console.error("❌ req.user no definido o id_persona ausente");
        return res.status(400).json({ message: "Conductor no definido" });
    }

    const idConductor = req.user.id_persona;
    console.log("🔹 ID del conductor:", idConductor);

    const sql = `
        SELECT 
            m.id_manifiesto,
            m.fecha AS fecha_manifiesto,
            e.id_encomienda,
            e.numero_guia,
            e.descripcion,
            e.estado_actual,
            e.valor_declarado,
            e.tarifa,
            so.nombre AS sucursal_origen,
            sd.nombre AS sucursal_destino
        FROM manifiesto m
        INNER JOIN manifiesto_encomienda me ON m.id_manifiesto = me.id_manifiesto
        INNER JOIN encomienda e ON me.id_encomienda = e.id_encomienda
        LEFT JOIN sucursal so ON e.id_sucursal_origen = so.id_sucursal
        LEFT JOIN sucursal sd ON e.id_sucursal_destino = sd.id_sucursal
        WHERE m.id_conductor = ?
        ORDER BY m.fecha DESC, e.id_encomienda DESC
    `;

    db.query(sql, [idConductor], (err, rows) => {
        if (err) {
            console.error("❌ Error ejecutando la query de manifiestos:", err.sqlMessage);
            return res.status(500).json({
                message: "Error obteniendo encomiendas del conductor",
                error: err.sqlMessage
            });
        }

        console.log("✅ Filas obtenidas:", rows.length);
        res.json(rows);
    });
};
const getManifiestoSecretaria = async (req, res) => {
  try {
    const idSecretaria = req.user.id_persona;

    // Obtener la sucursal de la secretaria
    const [[secretaria]] = await db.promise().query(
      `SELECT id_sucursal FROM persona WHERE id_persona = ?`,
      [idSecretaria]
    );

    if (!secretaria) {
      return res.status(404).json({ error: "Secretaria no encontrada" });
    }

    const idSucursal = secretaria.id_sucursal;

    // Traer manifiestos que tienen encomiendas cuyo destino es la sucursal de la secretaria
    const [manifiestos] = await db.promise().query(
      `SELECT DISTINCT m.id_manifiesto, m.numero_manifiesto, m.fecha,
               CONCAT(c.nombre, ' ', c.apellido) AS nombre_conductor
       FROM manifiesto m
       JOIN manifiesto_encomienda me ON m.id_manifiesto = me.id_manifiesto
       JOIN encomienda e ON me.id_encomienda = e.id_encomienda
       JOIN persona c ON m.id_conductor = c.id_persona
       WHERE e.id_sucursal_destino = ?`,
      [idSucursal]
    );

    // Traer las encomiendas de cada manifiesto
    for (const manifiesto of manifiestos) {
      const [encomiendas] = await db.promise().query(
        `SELECT e.id_encomienda, e.numero_guia, e.estado_actual
         FROM manifiesto_encomienda me
         JOIN encomienda e ON me.id_encomienda = e.id_encomienda
         WHERE me.id_manifiesto = ?`,
        [manifiesto.id_manifiesto]
      );

      manifiesto.encomiendas = encomiendas;
    }

    res.json(manifiestos);
  } catch (error) {
    console.error("Error al obtener manifiestos por recibir:", error);
    res.status(500).json({ error: "Error al obtener manifiestos por recibir" });
  }
};

module.exports = {
  asignarEncomiendas,
  getManifiestosSecretaria,
  getManifiestosConductor,
  getManifiestoDetalle,
  listarEncomiendasDeManifiesto,
  recibirEncomienda,
  recibirTodasDelManifiesto,
  getManifiestosConductorPersistentes,
  getManifiestoSecretaria
};
