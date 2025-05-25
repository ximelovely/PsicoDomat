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

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

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



testConnection();