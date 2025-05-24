const sql = require('mssql');
const { use } = require('react');

const config = {
    server: 'xime_compu',
    port: 1433,
    database: 'PSICODOMAT_BASEDATOS',
    user: 'XIME_COMPU\cruza',
    options: {
        trustedConnection: true, // Esto es clave para Windows Auth
        trustServerCertificate: true,
        driver: 'ODBC Driver 17 for SQL Server'
    }
};

async function connect() {
    try {
        await sql.connect(config);
        console.log('✅ Conexión exitosa!');
        
        const result = await sql.query`SELECT @@VERSION AS version`;
        console.log(result.recordset);
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        sql.close();
    }
}

connect();