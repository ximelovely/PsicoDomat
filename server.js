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

testConnection();