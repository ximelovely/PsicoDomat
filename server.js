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


// Obtener citas de la psicóloga
// 🔁 Ruta para obtener TODAS las citas activas
app.get('/citas-psicologa', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        Citas.ID_Cita,
        Citas.Fecha,
        CH.Hora,
        U.Nombre + ' ' + U.Apellido AS NombrePaciente,
        U.FechaNacimiento,
        S.Nombre AS Sucursal,
        SV.Descripcion AS Servicio
      FROM Citas
      INNER JOIN Usuarios U ON U.ID_Usuario = Citas.ID_UsuarioPaciente
      INNER JOIN CatalogoHoras CH ON CH.ID_Hora = Citas.Hora
      INNER JOIN Sucursales S ON S.ID_Sucursal = Citas.ID_Sucursal
      INNER JOIN Servicios SV ON SV.ID_Servicio = Citas.ID_Servicio
      WHERE Citas.EstadoCita = 1
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener citas de la psicóloga:", err);
    res.status(500).json({ error: 'Error al obtener citas' });
  } finally {
    await sql.close();
  }
});























app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

testConnection();