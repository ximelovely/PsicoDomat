   const config = {
       server: 'tu-servidor-sql', // Nombre del servidor o IP
       database: 'tu-base-de-datos', // Nombre de la base de datos
       user: 'tu-usuario', // Nombre de usuario
       password: 'tu-contraseña', // Contraseña
       options: {
           encrypt: false, // Desactiva el cifrado (si no es necesario)
           trustServerCertificate: true // Permite conexiones no seguras
       }
   };

   async function conectarSQL() {
       try {
           const pool = new sql.ConnectionPool(config);
           await pool.connect();
           console.log('Conexión a SQL Server establecida');
           return pool;
       } catch (error) {
           console.error('Error al conectar a SQL Server:', error);
           return null;
       }
   }