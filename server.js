const sql = require('mssql');

const dbConfig = {
    server: 'XIME_COMPU',
    database: 'PSICODOMAT_BASEDATOS',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        integratedSecurity: true  // ¡Clave aquí! Usará tu usuario Windows.
    }
};

// Ejemplo de conexión
async function connectToSQL() {
    try {
        await sql.connect(dbConfig);
        console.log("¡Conexión exitosa a SQL Server!");
    } catch (err) {
        console.error("Error de conexión:", err);
    }
}

connectToSQL();