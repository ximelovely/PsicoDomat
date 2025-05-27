const sql = require('mssql');

const config = {
    user: 'psico_user',
    password: 'psico123',
    server: 'XIME_COMPU',
    database: 'Psico_BD',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};


// ==========================
// 🔵 RUTAS PARA PACIENTES
// ==========================
async function testConnection() {
    try {
        await sql.connect(config);
        console.log('✅ ¡Conexión exitosa!');
        const result = await sql.query`SELECT name FROM sys.databases`;
        console.log('Bases de datos disponibles:', result.recordset);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sql.close();
    }
}

// ...existing code...
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Ruta de login para pacientes
app.post('/login', async (req, res) => {
    const { telefono, password } = req.body;
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT * FROM Usuarios 
            WHERE Telefono = ${telefono} 
            AND Contraseña = ${password}
            AND ID_Rol = 2
        `;

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            // Verificamos si tiene cita activa
            const citaResult = await sql.query`
                SELECT COUNT(*) AS total 
                FROM Citas 
                WHERE ID_UsuarioPaciente = ${user.ID_Usuario} AND EstadoCita = 1
            `;

            const tieneCita = citaResult.recordset[0].total > 0;

            res.json({ success: true, tieneCita });
        } else {
            res.json({ success: false, message: 'Teléfono o contraseña incorrectos.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    } finally {
        await sql.close();
    }
});

app.post('/tiene-cita', async (req, res) => {
    const { telefono } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT COUNT(*) AS total 
            FROM Citas 
            INNER JOIN Usuarios ON Citas.ID_UsuarioPaciente = Usuarios.ID_Usuario
            WHERE Usuarios.Telefono = ${telefono}
              AND Citas.EstadoCita = 1
              AND Citas.Fecha >= CAST(GETDATE() AS DATE)
        `;

        const tieneCita = result.recordset[0].total > 0;
        res.json({ tieneCita });
    } catch (err) {
        console.error('❌ Error en /tiene-cita:', err);
        res.status(500).json({ error: 'Error verificando cita' });
    } finally {
        await sql.close();
    }
});



app.get('/sucursales', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                ID_Sucursal,
                Nombre,
                Direccion,
                CostoMXN,
                CostoUSD,
                CONVERT(VARCHAR(5), HoraInicio, 108) AS HoraInicio,
                CONVERT(VARCHAR(5), HoraFin, 108) AS HoraFin
            FROM Sucursales
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener sucursales:', err);
        res.status(500).json({ error: 'Error al obtener sucursales' });
    } finally {
        await sql.close();
    }
});



// Obtener servicios
app.get('/servicios', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT ID_Servicio, Descripcion FROM Servicios`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener servicios:', err);
        res.status(500).json({ error: 'Error al obtener servicios' });
    } finally {
        await sql.close();
    }
});

// Obtener horarios por sucursal
app.post('/horarios', async (req, res) => {
    const { idSucursal, fecha } = req.body;

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT ch.ID_Hora, ch.Hora
            FROM CatalogoHoras ch
            WHERE ch.ID_Sucursal = ${idSucursal}
            AND ch.ID_Hora NOT IN (
                SELECT Hora FROM Citas 
                WHERE ID_Sucursal = ${idSucursal} 
                AND Fecha = ${fecha}
                AND EstadoCita = 1
            )
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener horarios:', err);
        res.status(500).json({ error: 'Error al obtener horarios' });
    } finally {
        await sql.close();
    }
});


app.post('/agendar-cita', async (req, res) => {
    const { telefono, fecha, idHora, idServicio, idSucursal } = req.body;

    try {
        await sql.connect(config);

        // Obtener el ID del paciente
        const userResult = await sql.query`
            SELECT ID_Usuario FROM Usuarios WHERE Telefono = ${telefono} AND ID_Rol = 2
        `;
        if (userResult.recordset.length === 0) {
            return res.status(400).json({ error: 'Paciente no encontrado' });
        }

        const idPaciente = userResult.recordset[0].ID_Usuario;

        // Solo hay una psicóloga: ID_Usuario = 1
        const idPsicologa = 1;

        // Insertar cita
        await sql.query`
            INSERT INTO Citas (Fecha, Hora, ID_Servicio, ID_UsuarioPaciente, ID_UsuarioPsicologo, ID_Sucursal, EstadoCita)
            VALUES (${fecha}, ${idHora}, ${idServicio}, ${idPaciente}, ${idPsicologa}, ${idSucursal}, 1)
        `;

        res.json({ success: true, message: 'Cita agendada correctamente' });
    } catch (err) {
        console.error('❌ Error al agendar cita:', err);
        res.status(500).json({ error: 'Error al agendar cita' });
    } finally {
        await sql.close();
    }
});



app.get('/psicologa', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                Nombre, 
                Apellido, 
                CedulaProfesional, 
                Descripcion 
            FROM Usuarios 
            WHERE ID_Rol = 1
        `;
        res.json(result.recordset[0]); // debe ser [0]
    } catch (err) {
        console.error('Error al obtener datos de la psicóloga:', err);
        res.status(500).json({ error: 'Error al obtener datos de la psicóloga' });
    } finally {
        await sql.close();
    }
});

app.post('/proxima-cita', async (req, res) => {
    const { telefono } = req.body;
    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT TOP 1 
                Citas.Fecha,
                CH.Hora,
                S.Nombre AS Sucursal,
                S.CostoMXN,
                S.CostoUSD,
                SV.Descripcion AS Servicio
            FROM Citas
            INNER JOIN Usuarios U ON U.ID_Usuario = Citas.ID_UsuarioPaciente
            INNER JOIN CatalogoHoras CH ON CH.ID_Hora = Citas.Hora
            INNER JOIN Sucursales S ON S.ID_Sucursal = Citas.ID_Sucursal
            INNER JOIN Servicios SV ON SV.ID_Servicio = Citas.ID_Servicio
            WHERE U.Telefono = ${telefono}
              AND Citas.EstadoCita = 1
              AND Citas.Fecha >= CAST(GETDATE() AS DATE)
            ORDER BY Citas.Fecha ASC, CH.Hora ASC
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No hay citas próximas' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('❌ Error al obtener próxima cita:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    } finally {
        await sql.close();
    }
});

app.post('/validar-fecha-sucursal', async (req, res) => {
    const { idSucursal, fecha } = req.body;
    try {
        await sql.connect(config);

        const fechaObj = new Date(fecha);
        const mes = fechaObj.getMonth() + 1;
        const año = fechaObj.getFullYear();

        // 1. Validar si esa sucursal está activa en ese mes
        const asignacion = await sql.query`
            SELECT * FROM SucursalMensual
            WHERE ID_Sucursal = ${idSucursal} AND Mes = ${mes} AND Año = ${año}
        `;
        if (asignacion.recordset.length === 0) {
            return res.status(400).json({ error: 'La sucursal no está activa este mes' });
        }

        // 2. Verificar si es día no laborable
        const diaNo = await sql.query`
            SELECT * FROM DiasNoLaborables
            WHERE Fecha = ${fecha} OR (Recurrente = 1 AND MONTH(Fecha) = ${mes} AND DAY(Fecha) = ${fechaObj.getDate()})
        `;
        if (diaNo.recordset.length > 0) {
            return res.status(400).json({ error: 'La fecha es un día no laborable' });
        }

        res.json({ valida: true });
    } catch (err) {
        console.error('❌ Error al validar fecha:', err);
        res.status(500).json({ error: 'Error del servidor al validar fecha' });
    } finally {
        await sql.close();
    }
});

app.post('/cancelar-cita', async (req, res) => {
    const { telefono } = req.body;
    try {
        await sql.connect(config);

        const result = await sql.query`
            UPDATE Citas SET EstadoCita = 0
            WHERE ID_UsuarioPaciente = (
                SELECT ID_Usuario FROM Usuarios WHERE Telefono = ${telefono}
            )
            AND Fecha >= CAST(GETDATE() AS DATE)
            AND EstadoCita = 1
        `;

        res.json({ success: true, message: 'Cita cancelada correctamente' });
    } catch (err) {
        console.error('❌ Error al cancelar cita:', err);
        res.status(500).json({ success: false, message: 'Error al cancelar cita' });
    } finally {
        await sql.close();
    }
});

app.post('/modificar-cita', async (req, res) => {
    const { telefono, fecha, idHora, idSucursal, idServicio } = req.body;
    try {
        await sql.connect(config);

        const userResult = await sql.query`
            SELECT ID_Usuario FROM Usuarios WHERE Telefono = ${telefono}
        `;
        const idPaciente = userResult.recordset[0]?.ID_Usuario;
        if (!idPaciente) {
            return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
        }

        // 1. Cancelar la cita anterior
        await sql.query`
            UPDATE Citas
            SET EstadoCita = 0
            WHERE ID_UsuarioPaciente = ${idPaciente}
            AND EstadoCita = 1
            AND Fecha >= CAST(GETDATE() AS DATE)
        `;

        // 2. Crear nueva cita (psicóloga siempre ID 1)
        await sql.query`
            INSERT INTO Citas (Fecha, Hora, ID_Servicio, ID_UsuarioPaciente, ID_UsuarioPsicologo, ID_Sucursal, EstadoCita)
            VALUES (${fecha}, ${idHora}, ${idServicio}, ${idPaciente}, 1, ${idSucursal}, 1)
        `;

        res.json({ success: true, message: 'Cita modificada exitosamente' });
    } catch (err) {
        console.error("❌ Error al modificar cita:", err);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    } finally {
        await sql.close();
    }
});


// ==========================
// 🟣 RUTAS PARA PSICÓLOGA
// ==========================
//Log-in de la psicóloga
// Ruta de login para psicóloga
app.post('/login-psicologa', async (req, res) => {
  const { telefono, password } = req.body;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT * FROM Usuarios
      WHERE Telefono = ${telefono}
      AND Contraseña = ${password}
      AND ID_Rol = 1
    `;
    res.json({ success: result.recordset.length > 0 });
  } catch {
    res.status(500).json({ success: false, message: 'Error en servidor' });
  } finally {
    await sql.close();
  }
});

app.post('/actualizar-descripcion', async (req, res) => {
  const { descripcion } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      UPDATE Usuarios SET Descripcion = ${descripcion}
      WHERE ID_Rol = 1
    `;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al actualizar descripción:", err);
    res.status(500).json({ success: false, message: 'Error al actualizar descripción' });
  } finally {
    await sql.close();
  }
});

app.get('/pacientes', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT ID_Usuario, Nombre, Apellido, Telefono, FechaNacimiento
      FROM Usuarios 
      WHERE ID_Rol = 2
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener pacientes:', err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  } finally {
    await sql.close();
  }
});

app.post('/agregar-cita-manual', async (req, res) => {
  const { idSucursal, fecha, idHora, idServicio, idPaciente } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO Citas (Fecha, Hora, ID_Servicio, ID_UsuarioPaciente, ID_UsuarioPsicologo, ID_Sucursal, EstadoCita)
      VALUES (${fecha}, ${idHora}, ${idServicio}, ${idPaciente}, 1, ${idSucursal}, 1)
    `;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al agregar cita:", err);
    res.status(500).json({ success: false, message: 'Error al guardar en la base de datos' });
  } finally {
    await sql.close();
  }
});

app.get('/sucursal/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT ID_Sucursal, Nombre, Direccion, CostoMXN, CostoUSD,
             CONVERT(VARCHAR(5), HoraInicio, 108) AS HoraInicio,
             CONVERT(VARCHAR(5), HoraFin, 108) AS HoraFin
      FROM Sucursales
      WHERE ID_Sucursal = ${id}
    `;
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error al obtener sucursal:", err);
    res.status(500).json({ error: 'Error al obtener sucursal' });
  } finally {
    await sql.close();
  }
});

app.put('/editar-ubicacion', async (req, res) => {
  const { idSucursal, nombre, direccion, costoMXN, costoUSD, horaInicio, horaFin } = req.body;
  try {
    await sql.connect(config);

    await sql.query`
      UPDATE Sucursales
      SET Nombre = ${nombre},
          Direccion = ${direccion},
          CostoMXN = ${costoMXN},
          CostoUSD = ${costoUSD},
          HoraInicio = ${horaInicio},
          HoraFin = ${horaFin}
      WHERE ID_Sucursal = ${idSucursal}
    `;

    console.log("✅ Ubicación actualizada");  // ← agrega esto si no lo tenías
    res.json({ success: true });               // ← esto es clave
  } catch (err) {
    console.error("❌ Error al editar ubicación:", err);
    res.status(500).json({ success: false, message: 'Error al editar ubicación' });
  } finally {
    await sql.close();
  }
});

app.post('/agregar-ubicacion', async (req, res) => {
  const { nombre, direccion, costoMXN, costoUSD, horaInicio, horaFin } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO Sucursales (Nombre, Direccion, CostoMXN, CostoUSD, HoraInicio, HoraFin)
      VALUES (${nombre}, ${direccion}, ${costoMXN}, ${costoUSD}, ${horaInicio}, ${horaFin})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al agregar ubicación:", err);
    res.status(500).json({ success: false, message: "Error al guardar en la base de datos" });
  } finally {
    await sql.close();
  }
});

app.get('/sucursal-existe', async (req, res) => {
  const nombre = req.query.nombre;
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT COUNT(*) AS total FROM Sucursales WHERE Nombre = ${nombre}
    `;
    res.json({ found: result.recordset[0].total > 0 });
  } catch (err) {
    console.error("❌ Error al validar sucursal:", err);
    res.status(500).json({ found: false });
  } finally {
    await sql.close();
  }
});

app.post('/agregar-ubicacion', async (req, res) => {
  const { nombre, direccion, costoMXN, costoUSD, horaInicio, horaFin } = req.body;
  try {
    await sql.connect(config);

    // 1. Insertar sucursal
    const insertSucursal = await sql.query`
      INSERT INTO Sucursales (Nombre, Direccion, CostoMXN, CostoUSD, HoraInicio, HoraFin)
      OUTPUT INSERTED.ID_Sucursal
      VALUES (${nombre}, ${direccion}, ${costoMXN}, ${costoUSD}, ${horaInicio}, ${horaFin})
    `;

    const idSucursal = insertSucursal.recordset[0].ID_Sucursal;

    // 2. Generar catálogo de horas (cada hora entre inicio y fin)
    const start = parseInt(horaInicio.split(":")[0]);
    const end = parseInt(horaFin.split(":")[0]);

    for (let h = start; h < end; h++) {
      const horaStr = `${h.toString().padStart(2, '0')}:00`;
      await sql.query`
        INSERT INTO CatalogoHoras (ID_Sucursal, Hora)
        VALUES (${idSucursal}, ${horaStr})
      `;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al agregar sucursal:", err);
    res.status(500).json({ success: false, message: 'Error al guardar en base de datos' });
  } finally {
    await sql.close();
  }
});

app.post('/fechas-no-validas', async (req, res) => {
  const { idSucursal } = req.body;

  try {
    await sql.connect(config);

    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();

    // ✅ Verifica si la sucursal está activa en este mes
    const resSucursal = await sql.query`
      SELECT * FROM SucursalMensual 
      WHERE ID_Sucursal = ${idSucursal} AND Mes = ${mes} AND Año = ${año}
    `;

    if (resSucursal.recordset.length === 0) {
      return res.status(404).json({ error: "Sucursal no activa este mes" });
    }

    // ✅ Traer días no laborables
    const diasNo = await sql.query`
      SELECT Fecha FROM DiasNoLaborables
      WHERE Recurrente = 0 OR (Recurrente = 1 AND MONTH(Fecha) = ${mes})
    `;

    const diasFormateados = diasNo.recordset.map(d =>
      new Date(d.Fecha).toISOString().split("T")[0]
    );

    res.json({ mes, año, diasNo: diasFormateados });
  } catch (err) {
    console.error("❌ Error en /fechas-no-validas:", err);
    res.status(500).json({ error: "Error al obtener días no válidos" });
  } finally {
    await sql.close();
  }
});

app.delete('/eliminar-sucursal/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql.connect(config);

    // Eliminar primero las citas asociadas a esa sucursal para evitar errores por claves foráneas
    await sql.query`DELETE FROM Citas WHERE ID_Sucursal = ${id}`;
    await sql.query`DELETE FROM CatalogoHoras WHERE ID_Sucursal = ${id}`;
    await sql.query`DELETE FROM SucursalMensual WHERE ID_Sucursal = ${id}`;

    // Finalmente eliminar la sucursal
    await sql.query`DELETE FROM Sucursales WHERE ID_Sucursal = ${id}`;

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al eliminar sucursal:", err);
    res.status(500).json({ success: false, message: "Error al eliminar la sucursal" });
  } finally {
    await sql.close();
  }
});

// Obtener todos los servicios

// Agregar nuevo servicio
app.post('/servicios', async (req, res) => {
  const { descripcion } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO Servicios (Descripcion)
      VALUES (${descripcion})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al agregar servicio:', err);
    res.status(500).json({ success: false, message: 'Error al agregar servicio' });
  } finally {
    await sql.close();
  }
});

// Editar servicio existente
app.put('/servicios/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { descripcion } = req.body;
  try {
    await sql.connect(config);
    await sql.query`
      UPDATE Servicios
      SET Descripcion = ${descripcion}
      WHERE ID_Servicio = ${id}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al editar servicio:', err);
    res.status(500).json({ success: false, message: 'Error al editar servicio' });
  } finally {
    await sql.close();
  }
});

// Eliminar servicio
app.delete('/servicios/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await sql.connect(config);
    await sql.query`
      DELETE FROM Servicios
      WHERE ID_Servicio = ${id}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al eliminar servicio:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar servicio' });
  } finally {
    await sql.close();
  }
});

app.post('/pacientes', async (req, res) => {
  const { nombre, apellido, telefono, fechaNacimiento, contrasena } = req.body;

  // Validación de campos requeridos
  if (!nombre || !apellido || !telefono || !fechaNacimiento || !contrasena) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  // Validación de formato de teléfono (solo dígitos, 10 dígitos típicos en México)
  const telefonoValido = /^\d{10}$/.test(telefono);
  if (!telefonoValido) {
    return res.status(400).json({ success: false, message: 'El teléfono debe tener exactamente 10 dígitos.' });
  }

  try {
    await sql.connect(config);

    // Verificar si el teléfono ya existe
    const check = await sql.query`
      SELECT COUNT(*) AS total FROM Usuarios WHERE Telefono = ${telefono}
    `;
    if (check.recordset[0].total > 0) {
      return res.status(400).json({ success: false, message: 'El número de teléfono ya está registrado.' });
    }

    // Insertar paciente
    await sql.query`
      INSERT INTO Usuarios (ID_Rol, Nombre, Apellido, Telefono, FechaNacimiento, Contraseña)
      VALUES (2, ${nombre}, ${apellido}, ${telefono}, ${fechaNacimiento}, ${contrasena})
    `;

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al registrar paciente:", err);
    res.status(500).json({ success: false, message: "Error al guardar paciente" });
  } finally {
    await sql.close();
  }
});

// Agregar días no laborables
app.post('/dias-no-laborables', async (req, res) => {
  const { fechas, recurrente } = req.body;

  try {
    await sql.connect(config);

    for (const fecha of fechas) {
      // Validar si hay una cita activa en esa fecha
      const conflictCheck = await sql.query`
        SELECT COUNT(*) AS total
        FROM Citas
        WHERE Fecha = ${fecha} AND EstadoCita = 1
      `;
      const tieneCitas = conflictCheck.recordset[0].total > 0;

      if (tieneCitas) {
        return res.status(400).json({
          success: false,
          message: `⚠️ Ya existe al menos una cita activa el ${fecha}. Modifique las citas antes de marcar este día como no laborable.`
        });
      }

      // Si no hay conflicto, registrar el día
      await sql.query`
        INSERT INTO DiasNoLaborables (Fecha, Recurrente)
        VALUES (${fecha}, ${recurrente ? 1 : 0})
      `;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al guardar días no laborables:", err);
    res.status(500).json({ success: false, message: "Error al guardar los días no laborables" });
  } finally {
    await sql.close();
  }
});


// Obtener todos los días no laborables
app.get('/dias-no-laborables', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT Fecha, Recurrente FROM DiasNoLaborables
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener días no laborables:", err);
    res.status(500).json({ success: false });
  } finally {
    await sql.close();
  }
});

// Asignar sucursal por meses
app.post('/asignar-sucursal', async (req, res) => {
  const { idSucursal, año, meses } = req.body;
  const añoNum = parseInt(año);
  const sucursalNum = parseInt(idSucursal);

  if (!sucursalNum || !añoNum || !Array.isArray(meses)) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  try {
    await sql.connect(config);

    for (const mes of meses) {
      // 1. Verificar si ya existe asignación para ese mes/año
      const existe = await sql.query`
        SELECT ID_Sucursal
        FROM SucursalMensual
        WHERE Año = ${añoNum} AND Mes = ${mes}
      `;

      if (existe.recordset.length > 0) {
        const idSucursalExistente = existe.recordset[0].ID_Sucursal;

        // 2. Verificar si hay citas para ese mes
        const citas = await sql.query`
          SELECT COUNT(*) AS total
          FROM Citas
          WHERE MONTH(Fecha) = ${mes} AND YEAR(Fecha) = ${añoNum} AND EstadoCita = 1
        `;

        if (citas.recordset[0].total > 0) {
          return res.status(400).json({
            success: false,
            message: `⚠️ Ya hay citas activas en ${mes}/${añoNum}. No se puede cambiar la sucursal.`
          });
        }

        // 3. Si no hay citas, actualizar la sucursal existente
        await sql.query`
          UPDATE SucursalMensual
          SET ID_Sucursal = ${sucursalNum}
          WHERE Año = ${añoNum} AND Mes = ${mes}
        `;
      } else {
        // 4. Si no existe asignación, crearla
        await sql.query`
          INSERT INTO SucursalMensual (ID_Sucursal, Año, Mes)
          VALUES (${sucursalNum}, ${añoNum}, ${mes})
        `;
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al asignar/cambiar sucursal:", err);
    res.status(500).json({ success: false, message: "Error en el servidor al asignar sucursal" });
  } finally {
    await sql.close();
  }
});



// Obtener asignaciones existentes
app.get('/asignaciones-sucursal', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT SM.ID_Sucursal, S.Nombre, SM.Año, SM.Mes
      FROM SucursalMensual SM
      JOIN Sucursales S ON S.ID_Sucursal = SM.ID_Sucursal
      ORDER BY SM.Año DESC, SM.Mes DESC
    `;

    const asignaciones = result.recordset.map(row => {
      const nombreMes = new Date(row.Año, row.Mes - 1)
        .toLocaleString("es-MX", { month: "long" });
      const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

      return {
        Nombre: row.Nombre,
        Periodo: `${mesCapitalizado} ${row.Año}`
      };
    });

    res.json(asignaciones);
  } catch (err) {
    console.error("❌ Error al obtener asignaciones de sucursal:", err);
    res.status(500).json({ success: false });
  } finally {
    await sql.close();
  }
});

// Reporte de pacientes por mes/año
app.post('/reporte-pacientes', async (req, res) => {
  const { mes, año } = req.body;

  if (!mes || !año) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros' });
  }

  try {
    await sql.connect(config);

    // 1. Citas agendadas y realizadas
    const status = await sql.query`
      SELECT 
        SUM(CASE WHEN EstadoCita = 1 THEN 1 ELSE 0 END) AS PorVer,
        SUM(CASE WHEN EstadoCita = 0 THEN 1 ELSE 0 END) AS Vistos
      FROM Citas
      WHERE MONTH(Fecha) = ${mes} AND YEAR(Fecha) = ${año}
    `;

    // 2. Citas por motivo
    const motivos = await sql.query`
      SELECT 
        S.Descripcion AS Motivo,
        COUNT(*) AS Total
      FROM Citas C
      JOIN Servicios S ON C.ID_Servicio = S.ID_Servicio
      WHERE MONTH(C.Fecha) = ${mes} AND YEAR(C.Fecha) = ${año}
      GROUP BY S.Descripcion
    `;

    // 3. Citas por sucursal
    const sucursales = await sql.query`
      SELECT 
        S.Nombre AS Sucursal,
        COUNT(*) AS Total
      FROM Citas C
      JOIN Sucursales S ON C.ID_Sucursal = S.ID_Sucursal
      WHERE MONTH(C.Fecha) = ${mes} AND YEAR(C.Fecha) = ${año}
      GROUP BY S.Nombre
    `;

    res.json({
      success: true,
      status: status.recordset[0],
      motivos: motivos.recordset,
      sucursales: sucursales.recordset
    });

  } catch (err) {
    console.error("❌ Error al generar reporte:", err);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  } finally {
    await sql.close();
  }
});

// Ruta para generar reporte de pacientes por mes y año
app.get('/reporte-pacientes', async (req, res) => {
  const mes = parseInt(req.query.mes);
  const año = parseInt(req.query.año);

  if (!mes || !año) {
    return res.status(400).json({ error: "Mes y año requeridos" });
  }

  try {
    await sql.connect(config);

    const totalVistos = await sql.query`
      SELECT COUNT(*) AS total
      FROM Citas
      WHERE MONTH(Fecha) = ${mes} AND YEAR(Fecha) = ${año} AND EstadoCita = 0
    `;
    const totalPendientes = await sql.query`
      SELECT COUNT(*) AS total
      FROM Citas
      WHERE MONTH(Fecha) = ${mes} AND YEAR(Fecha) = ${año} AND EstadoCita = 1
    `;
    const porMotivo = await sql.query`
      SELECT S.Descripcion, COUNT(*) AS Total
      FROM Citas C
      JOIN Servicios S ON S.ID_Servicio = C.ID_Servicio
      WHERE MONTH(C.Fecha) = ${mes} AND YEAR(C.Fecha) = ${año}
      GROUP BY S.Descripcion
    `;
    const porSucursal = await sql.query`
      SELECT SU.Nombre, COUNT(*) AS Total
      FROM Citas C
      JOIN Sucursales SU ON SU.ID_Sucursal = C.ID_Sucursal
      WHERE MONTH(C.Fecha) = ${mes} AND YEAR(C.Fecha) = ${año}
      GROUP BY SU.Nombre
    `;

    res.json({
      totalVistos: totalVistos.recordset[0].total,
      totalPendientes: totalPendientes.recordset[0].total,
      porMotivo: porMotivo.recordset,
      porSucursal: porSucursal.recordset
    });
  } catch (err) {
    console.error("❌ Error en /reporte-pacientes:", err);
    res.status(500).json({ error: "Error al obtener el reporte" });
  } finally {
    await sql.close();
  }
});

// Obtener citas por mes y año
// 🔄 Obtener citas por mes para la psicóloga
app.get('/citas-por-mes', async (req, res) => {
  const { año, mes } = req.query;

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        C.ID_Cita,
        C.Fecha,
        CH.Hora,
        U.Nombre,
        U.FechaNacimiento,
        S.Nombre AS Sucursal,
        SV.Descripcion AS Motivo,
        C.EstadoCita

      FROM Citas C
      INNER JOIN Usuarios U ON C.ID_UsuarioPaciente = U.ID_Usuario
      INNER JOIN CatalogoHoras CH ON CH.ID_Hora = C.Hora
      INNER JOIN Sucursales S ON C.ID_Sucursal = S.ID_Sucursal
      INNER JOIN Servicios SV ON SV.ID_Servicio = C.ID_Servicio
      WHERE MONTH(C.Fecha) = ${mes} AND YEAR(C.Fecha) = ${año}
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener citas:", err);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    await sql.close();
  }
});

























app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

testConnection();