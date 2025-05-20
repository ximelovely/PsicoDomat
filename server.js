const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite peticiones desde tu HTML

// Configura los datos de tu servidor SQL Server
const config = {
    user: 'xime_compu\cruza',
    server: 'XIME_COMPU', // o IP o nombre de host
    database: 'PSICODOMAT_BASEDATOS',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

// Ruta de prueba para obtener datos
app.get('/datos', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM Usuarios'); // Cambia 'Usuarios' por tu tabla
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en la conexión o consulta');
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
