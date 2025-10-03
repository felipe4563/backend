const db = require('../config/db');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {sendWhatsApp} = require('../watsap/watsapclient');

// Función para enviar mensajes con retraso (rate limiting) - MODIFICADA
async function enviarMensajesEscalonados(mensajes, delay = 5000) {
  for (const { celular, mensaje, imagen } of mensajes) {
    try {
      if (imagen) {
        // Enviar mensaje con imagen
        await sendWhatsApp(celular, mensaje, imagen);
        console.log(`Mensaje con imagen enviado a ${celular}`);
      } else {
        // Enviar solo texto
        await sendWhatsApp(celular, mensaje);
        console.log(`Mensaje enviado a ${celular}`);
      }
    } catch (error) {
      console.error(`Error al enviar mensaje a ${celular}:`, error);
    }
    // Espera antes de enviar el siguiente mensaje
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
function formatPhoneNumber(numero) {
  if (!numero) return null;
  numero = numero.replace(/\D/g, '');
  if (numero.startsWith('591')) return `+${numero}`;
  if (numero.startsWith('0')) return `+591${numero.slice(1)}`;
  return `+591${numero}`;
}
// Función para obtener siglas de una sucursal
const getSiglaSucursal = (nombre) => {
  const sinEspacios = nombre.replace(/\s+/g, '');
  return sinEspacios.length >= 3 
    ? sinEspacios.substring(0, 3).toUpperCase()
    : sinEspacios.toUpperCase().padEnd(3, 'X'); // llena con 'X' si es muy corto
};

const getSiglaSector = (nombre) => {
  const sinEspacios = nombre.replace(/\s+/g, '');
  return sinEspacios.length >= 3 
    ? sinEspacios.substring(0, 3).toUpperCase()
    : sinEspacios.toUpperCase().padEnd(3, 'X');
};

// Inserta persona si no existe por CI, devuelve el ID
async function insertarOPreexistentePersona(persona) {
  const [rows] = await db.promise().query(
    'SELECT id_persona, celular FROM persona WHERE ci = ?',
    [persona.ci]
  );

  if (rows.length > 0) {
    const id_persona = rows[0].id_persona;

    // Actualizar datos si cambió el celular o correo
    const updates = [];
    const valores = [];

    if (persona.celular && persona.celular !== rows[0].celular) {
      updates.push('celular = ?');
      valores.push(persona.celular);
    }

    if (persona.correo) { // opcional, puedes hacer lo mismo para correo
      updates.push('correo = ?');
      valores.push(persona.correo);
    }

    if (updates.length > 0) {
      valores.push(id_persona);
      await db.promise().query(
        `UPDATE persona SET ${updates.join(', ')} WHERE id_persona = ?`,
        valores
      );
    }

    return id_persona;
  }

  const campos = ['ci', 'nombre', 'apellido'];
  const valores = [persona.ci, persona.nombre, persona.apellido];

  if (persona.celular) {
    campos.push('celular');
    valores.push(persona.celular);
  }
  if (persona.correo) {
    campos.push('correo');
    valores.push(persona.correo);
  }

  const query = `INSERT INTO persona (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`;
  const [result] = await db.promise().query(query, valores);
  return result.insertId;
}

// Controlador para registrar una nueva encomienda
const registrarEncomienda = async (req, res) => {
  const {
    remitente,
    consignatorio,
    id_sucursal_destino,
    descripcion,
    valor_declarado,
    tarifa,
  } = req.body;

  const id_secretaria = req.user.id_persona;
  const rol = req.user.rol;

  if (rol !== 2) {
    return res.status(403).json({ error: "Solo las secretarias pueden registrar encomiendas" });
  }

  try {
    // 1. Validar sucursal destino
    const [[dest]] = await db
      .promise()
      .query("SELECT nombre FROM sucursal WHERE id_sucursal = ?", [id_sucursal_destino]);

    if (!dest) return res.status(400).json({ error: "Sucursal destino inválida" });

    // 2. Obtener sucursal origen y sector de secretaria
    const [[secretaria]] = await db.promise().query(
      `SELECT s.id_sucursal, s.nombre AS sucursal, ss.porcentaje_empresa, sec.nombre AS sector
       FROM persona p
       JOIN sucursal s ON p.id_sucursal = s.id_sucursal
       JOIN sector_sucursal sec ON s.id_sector = sec.id_sector
       JOIN sector_sucursal ss ON s.id_sector = ss.id_sector
       WHERE p.id_persona = ?`,
      [id_secretaria]
    );

    if (!secretaria) return res.status(400).json({ error: "Secretaria no válida" });

    const id_sucursal_origen = secretaria.id_sucursal;

    // 3. Obtener siglas
    const siglaSector = getSiglaSector(secretaria.sector);
    const siglaOrigen = getSiglaSucursal(secretaria.sucursal);
    const siglaDestino = getSiglaSucursal(dest.nombre);

    // 4. Calcular montos
    const porcentajeEmpresa = parseFloat(secretaria.porcentaje_empresa);
    const monto_empresa = (tarifa * (porcentajeEmpresa / 100)).toFixed(2);
    const monto_conductor = (tarifa - monto_empresa).toFixed(2);

    // 5. Formatear teléfonos
    remitente.celular = formatPhoneNumber(remitente.celular);
    consignatorio.celular = formatPhoneNumber(consignatorio.celular);

    // 6. Insertar o reutilizar personas
    const id_remitente = await insertarOPreexistentePersona(remitente);
    const id_consignatorio = await insertarOPreexistentePersona(consignatorio);

    // 7. Generar número de guía único con sector
    const [[{ maxCorrelativo }]] = await db.promise().query(
      `SELECT MAX(CAST(SUBSTRING_INDEX(numero_guia, '-', -1) AS UNSIGNED)) as maxCorrelativo 
       FROM encomienda 
       WHERE id_sucursal_origen = ? AND id_sucursal_destino = ?
       AND numero_guia LIKE ?`,
      [
        id_sucursal_origen,
        id_sucursal_destino,
        `120-${siglaSector}-${siglaOrigen}-${siglaDestino}-%`
      ]
    );

    const numeroCorrelativo = String((maxCorrelativo || 0) + 1).padStart(3, "0");
    const numero_guia = `120-${siglaSector}-${siglaOrigen}-${siglaDestino}-${numeroCorrelativo}`;

    // 8. Generar PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // 9. Generar QR
    const qrBaseUrl = process.env.QR_BASE_URL || "http://localhost:5173/qr";
    const qrData = `${qrBaseUrl}/${numero_guia}`;
    const qrPath = path.join(__dirname, `../public/qrcodes/${numero_guia}.png`);

    if (!fs.existsSync(path.dirname(qrPath))) {
      fs.mkdirSync(path.dirname(qrPath), { recursive: true });
    }

    await QRCode.toFile(qrPath, qrData);

    // 10. Estado inicial
    const estadoInicial = "EN OFICINAS DE ORIGEN";

    // 11. Insertar encomienda
    const [encResult] = await db.promise().query(
      `INSERT INTO encomienda (
        numero_guia, id_secretaria, id_remitente, id_consignatorio,
        id_sucursal_origen, id_sucursal_destino, fecha,
        descripcion, valor_declarado, tarifa, monto_empresa, monto_conductor,
        qr_path, estado_actual, pin, comprobante_url
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_guia,
        id_secretaria,
        id_remitente,
        id_consignatorio,
        id_sucursal_origen,
        id_sucursal_destino,
        descripcion,
        valor_declarado,
        tarifa,
        monto_empresa,
        monto_conductor,
        `/qrcodes/${numero_guia}.png`,
        estadoInicial,
        pin,
        null,
      ]
    );

    const id_encomienda = encResult.insertId;

    // 12. Insertar historial
    await db.promise().query(
      `INSERT INTO historial_estado (id_encomienda, estado, registrado_por) 
       VALUES (?, ?, ?)`,
      [id_encomienda, estadoInicial, id_secretaria]
    );

    // 13. Obtener info de remitente y consignatorio
    const [[rem]] = await db.promise().query(
      "SELECT nombre, celular FROM persona WHERE id_persona = ?",
      [id_remitente]
    );
    const [[cons]] = await db.promise().query(
      "SELECT nombre, celular FROM persona WHERE id_persona = ?",
      [id_consignatorio]
    );

    // 14. Preparar mensaje
    const mensajeComun = `
📦 *Encomienda registrada*

*Guía:* ${numero_guia}
*Origen:* ${secretaria.sucursal} (Sector: ${secretaria.sector})
*Destino:* ${dest.nombre}
*Descripción:* ${descripcion || "-"}
*Estado:* ${estadoInicial}
*Valor declarado:* ${valor_declarado || "0.00"}
*Tarifa:* ${tarifa || "0.00"}
*PIN:* ${pin}
*Enlace seguimiento:* ${process.env.BASE_URL || 'http://localhost:5173'}/qr/${numero_guia}

¡Gracias por usar nuestro servicio!
`;

    // 15. Enviar mensajes
    await enviarMensajesEscalonados(
      [
        { 
          celular: rem.celular, 
          mensaje: `Hola ${rem.nombre},\n\n${mensajeComun}`,
        },
        { 
          celular: cons.celular, 
          mensaje: `Hola ${cons.nombre},\n\n${mensajeComun}`,
          imagen: qrPath
        },
      ],
      5000
    );

    // 16. Respuesta
    res.status(201).json({
      mensaje: "Encomienda registrada exitosamente",
      id_encomienda,
      numero_guia,
      monto_empresa,
      monto_conductor,
      estado: estadoInicial,
      pin,
      qr_url: `/qrcodes/${numero_guia}.png`,
    });

  } catch (error) {
    console.error("❌ Error al registrar encomienda:", error);
    res.status(500).json({ error: "Error al registrar encomienda" });
  }
};


// Este controlador obtiene una encomienda por su ID, incluyendo detalles del remitente, consignatario, sucursales y conductor.
const getEncomiendaPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        e.*, 
        CONCAT(rem.nombre, ' ', rem.apellido) AS remitente_nombre,
        rem.ci AS remitente_ci,
        rem.celular AS remitente_celular,
        CONCAT(con.nombre, ' ', con.apellido) AS consignatario_nombre,
        con.ci AS consignatario_ci,
        con.celular AS consignatario_celular,
        con.correo AS consignatario_correo,
        so.nombre AS sucursal_origen,
        sd.nombre AS sucursal_destino,
        CONCAT(c.nombre, ' ', c.apellido) AS conductor_nombre
      FROM encomienda e
      LEFT JOIN persona rem ON rem.id_persona = e.id_remitente
      LEFT JOIN persona con ON con.id_persona = e.id_consignatorio
      LEFT JOIN persona c ON c.id_persona = e.id_conductor
      LEFT JOIN sucursal so ON so.id_sucursal = e.id_sucursal_origen
      LEFT JOIN sucursal sd ON sd.id_sucursal = e.id_sucursal_destino
      WHERE e.id_encomienda = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Encomienda no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener encomienda' });
  }
};
// Este controlador obtiene todas las encomiendas asociadas a una secretaria específica, filtrando por su ID.
// Solo las secretarias (rol 2) pueden acceder a este endpoint.
// Se espera que el usuario esté autenticado y su ID de persona esté disponible en req.user
// El resultado incluye detalles de la encomienda, sucursal de destino, remitente y consign
const getEncomiendasPorSecretaria = async (req, res) => {
  const id_secretaria = req.user.id_persona;
  const rol = req.user.rol;

  if (rol !== 2) {
    return res.status(403).json({ error: 'Acceso denegado. Solo secretarias pueden acceder.' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Contar el total de encomiendas
    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) AS total 
       FROM encomienda 
       WHERE id_secretaria = ?`,
      [id_secretaria]
    );
    const total = countResult[0].total;

    // Obtener las encomiendas paginadas sin mostrar CI
    const [rows] = await db.promise().query(
      `SELECT 
        e.id_encomienda, 
        e.numero_guia, 
        e.fecha, 
        s.nombre AS sucursal_destino, 
        CONCAT(p.nombre, ' ', p.apellido) AS remitente, 
        CONCAT(c.nombre, ' ', c.apellido) AS consignatario, 
        e.tarifa,
        e.estado_actual,
        CONCAT(co.nombre, ' ', co.apellido) AS conductor
      FROM encomienda e
      JOIN sucursal s ON e.id_sucursal_destino = s.id_sucursal
      JOIN persona p ON e.id_remitente = p.id_persona
      JOIN persona c ON e.id_consignatorio = c.id_persona
      LEFT JOIN persona co ON e.id_conductor = co.id_persona
      WHERE e.id_secretaria = ?
      ORDER BY FIELD(e.estado_actual, 
                    'EN OFICINAS DE ORIGEN', 
                    'ASIGNADO A CONDUCTOR', 
                    'EN TRÁNSITO', 
                    'EN OFICINAS DE DESTINO', 
                    'ENTREGADO'), 
                e.fecha DESC
      LIMIT ? OFFSET ?`,
      [id_secretaria, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('❌ Error al obtener encomiendas por secretaria:', error);
    res.status(500).json({ error: 'Error al obtener encomiendas' });
  }
};

// Este controlador obtiene encomiendas filtradas por varios parámetros, incluyendo fechas, secretaria, conductor, sucursales y número de guía.
// Permite a los administradores consultar encomiendas específicas basadas en criterios de búsqueda.
// Se espera que el usuario esté autenticado y su ID de persona esté disponible en req.user
// El resultado incluye detalles de la encomienda, sucursal de origen y destino, secretaria y

const getStickerInfo = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.promise().query(`
      SELECT 
        e.numero_guia,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre,
        so.nombre AS sucursal_origen,
        sd.nombre AS sucursal_destino,
        e.qr_path
      FROM encomienda e
      LEFT JOIN persona p ON p.id_persona = e.id_consignatorio
      LEFT JOIN sucursal so ON so.id_sucursal = e.id_sucursal_origen
      LEFT JOIN sucursal sd ON sd.id_sucursal = e.id_sucursal_destino
      WHERE e.id_encomienda = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Encomienda no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar datos del sticker' });
  }
};

const getEncomiendasRecepcionadas = async (req, res) => {
  try {
    const idSucursal = req.user.id_sucursal;

    if (!idSucursal) {
      return res.status(400).json({ error: 'Sucursal no encontrada en el token' });
    }

    const sql = `
      SELECT 
        e.id_encomienda,
        e.numero_guia,
        e.fecha,
        e.tarifa,
        e.estado_actual,
        s.nombre AS sucursal_destino,
        remitente.nombre AS remitente_nombre,
        remitente.apellido AS remitente_apellido,
        consignatario.nombre AS consignatario_nombre,
        consignatario.apellido AS consignatario_apellido
      FROM encomienda e
      LEFT JOIN sucursal s ON e.id_sucursal_destino = s.id_sucursal
      LEFT JOIN persona remitente ON e.id_remitente = remitente.id_persona
      LEFT JOIN persona consignatario ON e.id_consignatorio = consignatario.id_persona
      WHERE e.estado_actual = 'EN OFICINAS DE DESTINO'
        AND e.id_sucursal_destino = ?
    `;

    db.query(sql, [idSucursal], (err, results) => {
      if (err) {
        console.error('Error al obtener encomiendas recepcionadas:', err);
        return res.status(500).json({ error: 'Error al obtener encomiendas recepcionadas' });
      }

      res.json(results);
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).json({ error: 'Error inesperado del servidor' });
  }
};

// Este controlador asigna encomiendas a un conductor, generando un manifiesto y actualizando el estado de las encomiendas.
const escanearEncomienda = (req, res) => {
  const { id_manifiesto } = req.params;
  const { numero_guia } = req.body;
  const id_conductor = req.user.id_persona; // conductor logueado
  const fecha = new Date();

  if (!numero_guia) {
    return res.status(400).json({ error: "Falta número de guía" });
  }

  // 1. Verificar que la encomienda pertenece al manifiesto y al conductor
  const query = `
    SELECT e.id_encomienda, e.numero_guia, e.descripcion,
           r.nombre AS remitente_nombre, r.celular AS remitente_cel,
           c.nombre AS consignatario_nombre, c.celular AS consignatario_cel
    FROM manifiesto_encomienda me
    JOIN encomienda e ON me.id_encomienda = e.id_encomienda
    JOIN persona r ON e.id_remitente = r.id_persona
    JOIN persona c ON e.id_consignatorio = c.id_persona
    JOIN manifiesto m ON me.id_manifiesto = m.id_manifiesto
    WHERE me.id_manifiesto = ? AND e.numero_guia = ? AND m.id_conductor = ?
  `;

  db.query(query, [id_manifiesto, numero_guia, id_conductor], (err, results) => {
    if (err) {
      console.error("❌ Error al buscar encomienda:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "La encomienda no pertenece al manifiesto o al conductor" });
    }

    const encomienda = results[0];

    // 2. Actualizar estado de la encomienda a "EN TRÁNSITO"
    db.query(
      `UPDATE encomienda SET estado_actual = 'EN TRÁNSITO' WHERE id_encomienda = ?`,
      [encomienda.id_encomienda],
      (err) => {
        if (err) {
          console.error("❌ Error al actualizar estado:", err);
          return res.status(500).json({ error: "Error al actualizar encomienda" });
        }

        // 3. Insertar en historial_estado
        db.query(
          `INSERT INTO historial_estado (id_encomienda, estado, fecha) VALUES (?, ?, ?)`,
          [encomienda.id_encomienda, "EN TRÁNSITO", fecha],
          async (err) => {
            if (err) {
              console.error("❌ Error al insertar historial:", err);
              return res.status(500).json({ error: "Error al registrar historial" });
            }

            // 4. Enviar mensaje WhatsApp
            const hora = fecha.getHours();
            const saludo =
              hora < 12 ? "Buenos días 👋" : hora < 19 ? "Buenas tardes 👋" : "Buenas noches 🌙";

            const mensaje = `
${saludo}
La encomienda *${encomienda.numero_guia}* ya fue recogida por el conductor y está en tránsito 🚚.
Descripción: ${encomienda.descripcion || "-"}
`;

            try {
              if (encomienda.remitente_cel) {
                await sendWhatsApp(encomienda.remitente_cel, mensaje);
              }
              if (encomienda.consignatario_cel) {
                await sendWhatsApp(encomienda.consignatario_cel, mensaje);
              }
            } catch (err) {
              console.error("⚠️ Error al enviar WhatsApp:", err);
            }

            // 5. Actualizar manifiesto a EN TRÁNSITO si aún está ASIGNADO
            db.query(
              `UPDATE manifiesto SET estado = 'EN TRÁNSITO' 
               WHERE id_manifiesto = ? AND estado = 'ASIGNADO'`,
              [id_manifiesto],
              (err) => {
                if (err) {
                  console.error("❌ Error al actualizar estado de manifiesto:", err);
                  return res.status(500).json({ error: "Error al actualizar manifiesto" });
                }

                // 6. Responder
                return res.json({
                  success: true,
                  message: `Encomienda ${encomienda.numero_guia} marcada en tránsito ✅. El manifiesto pasó a EN TRÁNSITO.`,
                  encomienda: encomienda.numero_guia,
                });
              }
            );
          }
        );
      }
    );
  });
};

const entregarEncomienda = (req, res) => {
  const { id_manifiesto } = req.params;
  const { numero_guia } = req.body;
  const id_secretaria = req.user.id_persona; // secretaria logueada
  const rol = req.user.rol;
  const fecha = new Date();

  if (rol !== 2) { // 2 = secretaria
    return res.status(403).json({ error: "Solo las secretarias pueden actualizar encomiendas" });
  }

  if (!numero_guia) {
    return res.status(400).json({ error: "Falta número de guía" });
  }

  // 1. Obtener la encomienda junto con la sucursal de destino
  const query = `
    SELECT e.id_encomienda, e.numero_guia, e.descripcion, e.id_sucursal_destino,
           r.nombre AS remitente_nombre, r.celular AS remitente_cel,
           c.nombre AS consignatario_nombre, c.celular AS consignatario_cel,
           s.nombre AS sucursal_nombre, s.ubicacion AS sucursal_ubicacion
    FROM manifiesto_encomienda me
    JOIN encomienda e ON me.id_encomienda = e.id_encomienda
    JOIN persona r ON e.id_remitente = r.id_persona
    JOIN persona c ON e.id_consignatorio = c.id_persona
    JOIN sucursal s ON e.id_sucursal_destino = s.id_sucursal
    WHERE me.id_manifiesto = ? AND e.numero_guia = ?
  `;

  db.query(query, [id_manifiesto, numero_guia], (err, results) => {
    if (err) {
      console.error("❌ Error al buscar encomienda:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "La encomienda no pertenece al manifiesto" });
    }

    const encomienda = results[0];

    // 2. Actualizar estado a EN OFICINAS DE DESTINO
    db.query(
      `UPDATE encomienda SET estado_actual = 'EN OFICINAS DE DESTINO' WHERE id_encomienda = ?`,
      [encomienda.id_encomienda],
      (err) => {
        if (err) {
          console.error("❌ Error al actualizar estado:", err);
          return res.status(500).json({ error: "Error al actualizar encomienda" });
        }

        // 3. Insertar en historial_estado
        db.query(
          `INSERT INTO historial_estado (id_encomienda, estado, fecha) VALUES (?, ?, ?)`,
          [encomienda.id_encomienda, "EN OFICINAS DE DESTINO", fecha],
          async (err) => {
            if (err) {
              console.error("❌ Error al insertar historial:", err);
              return res.status(500).json({ error: "Error al registrar historial" });
            }

            // 4. Enviar mensaje WhatsApp
            const hora = fecha.getHours();
            const saludo =
              hora < 12 ? "Buenos días 👋" : hora < 19 ? "Buenas tardes 👋" : "Buenas noches 🌙";

            const mensaje = `
${saludo}
La encomienda *${encomienda.numero_guia}* ya se encuentra en las oficinas de destino, lista para recoger.
Sucursal: ${encomienda.sucursal_nombre} - ${encomienda.sucursal_ubicacion || '-'}
Descripción: ${encomienda.descripcion || "-"}
`;

            try {
              if (encomienda.remitente_cel) {
                await sendWhatsApp(encomienda.remitente_cel, mensaje);
              }
              if (encomienda.consignatario_cel) {
                await sendWhatsApp(encomienda.consignatario_cel, mensaje);
              }
            } catch (err) {
              console.error("⚠️ Error al enviar WhatsApp:", err);
            }

            // 5. Verificar si todas las encomiendas del manifiesto ya están en oficinas de destino
            const checkQuery = `
              SELECT COUNT(*) AS total,
                     SUM(CASE WHEN e.estado_actual = 'EN OFICINAS DE DESTINO' THEN 1 ELSE 0 END) AS en_oficinas
              FROM manifiesto_encomienda me
              JOIN encomienda e ON me.id_encomienda = e.id_encomienda
              WHERE me.id_manifiesto = ?
            `;

            db.query(checkQuery, [id_manifiesto], (err, rows) => {
              if (err) {
                console.error("❌ Error al verificar encomiendas del manifiesto:", err);
                return res.status(500).json({ error: "Error al verificar manifiesto" });
              }

              const { total, en_oficinas } = rows[0];

              if (total > 0 && total === en_oficinas) {
                // Todas las encomiendas están en oficinas → actualizar manifiesto
                db.query(
                  `UPDATE manifiesto SET estado = 'ENTREGADO' WHERE id_manifiesto = ?`,
                  [id_manifiesto],
                  (err) => {
                    if (err) {
                      console.error("❌ Error al actualizar estado de manifiesto:", err);
                      return res.status(500).json({ error: "Error al actualizar manifiesto" });
                    }

                    return res.json({
                      success: true,
                      message: `Encomienda ${encomienda.numero_guia} marcada en oficinas de destino ✅. Todas las encomiendas del manifiesto están listas para recoger.`,
                      encomienda: encomienda.numero_guia,
                    });
                  }
                );
              } else {
                return res.json({
                  success: true,
                  message: `Encomienda ${encomienda.numero_guia} marcada en oficinas de destino ✅. Faltan ${total - en_oficinas} por procesar.`,
                  encomienda: encomienda.numero_guia,
                });
              }
            });
          }
        );
      }
    );
  });
};
// 1. Validar encomienda por token QR o PIN
// 1. Obtener encomienda por PIN o número de guía
const getEncomiendaPorPinONumero = async (req, res) => {
  const { pin, numero_guia } = req.body;

  try {
    let query = `
      SELECT e.id_encomienda, e.numero_guia, e.descripcion, 
             p.nombre AS consignatario_nombre, p.apellido AS consignatario_apellido
      FROM encomienda e
      JOIN persona p ON p.id_persona = e.id_consignatorio
      WHERE 1=1
    `;
    let params = [];

    if (pin) {
      query += " AND e.pin = ?";
      params.push(pin);
    } else if (numero_guia) {
      query += " AND e.numero_guia = ?";
      params.push(numero_guia);
    } else {
      return res.status(400).json({ error: "Se requiere PIN o número de guía" });
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Encomienda no encontrada" });
      }

      res.json(results[0]);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al validar encomienda" });
  }
};

// 2. Confirmar entrega
const confirmarEntrega = async (req, res) => {
  const { numero_guia, pin } = req.body; 
  const { id_persona, rol, id_sucursal } = req.user;

  // Solo secretarias pueden entregar
  if (rol !== 2) {
    return res.status(403).json({ error: "Solo las secretarias pueden entregar encomiendas" });
  }

  if (!numero_guia || !pin) {
    return res.status(400).json({ error: "Se requiere número de guía y PIN" });
  }

  try {
    // Buscar encomienda por número de guía
    db.query(
      `SELECT id_encomienda, id_sucursal_destino, estado_actual, pin AS pin_guardado
       FROM encomienda 
       WHERE numero_guia = ?`,
      [numero_guia],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Error en la base de datos" });
        if (results.length === 0) return res.status(404).json({ error: "Encomienda no encontrada" });

        const encomienda = results[0];

        // Validar sucursal
        if (encomienda.id_sucursal_destino !== id_sucursal) {
          return res.status(403).json({ error: "No puede entregar encomiendas de otra sucursal" });
        }

        // Validar estado
        if (encomienda.estado_actual !== "EN OFICINAS DE DESTINO") {
          return res.status(400).json({ error: "La encomienda aún no llegó a destino" });
        }

        // Validar PIN
        if (encomienda.pin_guardado !== pin) {
          return res.status(401).json({ error: "PIN inválido" });
        }

        // Actualizar estado a ENTREGADO
        db.query(
          "UPDATE encomienda SET estado_actual = 'ENTREGADO' WHERE id_encomienda = ?",
          [encomienda.id_encomienda],
          (err2) => {
            if (err2) return res.status(500).json({ error: "Error al actualizar encomienda" });

            // Insertar en historial
            db.query(
              "INSERT INTO historial_estado (id_encomienda, estado, registrado_por) VALUES (?, 'ENTREGADO', ?)",
              [encomienda.id_encomienda, id_persona],
              (err3) => {
                if (err3) return res.status(500).json({ error: "Error al registrar historial" });
                res.json({ message: "Entrega confirmada con éxito" });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al confirmar entrega" });
  }
};

// 3. Generar comprobante en texto plano (para 80mm)
const getComprobanteEntrega = async (req, res) => {
  const { numero_guia } = req.params;
  const { id_persona } = req.user; // id de la secretaria logueada

  if (!numero_guia) return res.status(400).json({ error: "Se requiere el número de guía" });

  try {
    // 🔹 Consulta principal de la encomienda
    db.query(
      `SELECT e.numero_guia, e.descripcion, e.tarifa,
              CONCAT(r.nombre, ' ', r.apellido) AS remitente,
              CONCAT(c.nombre, ' ', c.apellido) AS consignatario,
              c.ci AS ci_consignatario
       FROM encomienda e
       JOIN persona r ON r.id_persona = e.id_remitente
       JOIN persona c ON c.id_persona = e.id_consignatorio
       WHERE e.numero_guia = ?`,
      [numero_guia],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Error en la base de datos" });
        if (results.length === 0) return res.status(404).json({ error: "Encomienda no encontrada" });

        const encomienda = results[0];

        // 🔹 Obtener el nombre de la secretaria logueada
        db.query(
          `SELECT nombre, apellido FROM persona WHERE id_persona = ?`,
          [id_persona],
          (err2, secResults) => {
            if (err2) return res.status(500).json({ error: "Error al obtener secretaria" });
            const secretaria = secResults[0];
            
            res.json({
              ...encomienda,
              secretaria: secretaria ? `${secretaria.nombre} ${secretaria.apellido}` : "Secretaria"
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar comprobante" });
  }
};


module.exports = {
    getEncomiendaPorId,
    registrarEncomienda,
    getEncomiendasPorSecretaria,
    getStickerInfo,
    getEncomiendasRecepcionadas,
    escanearEncomienda,
    entregarEncomienda,
    getEncomiendaPorPinONumero,
    confirmarEntrega,
    getComprobanteEntrega
};
