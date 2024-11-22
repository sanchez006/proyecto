const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Si no tienes certificado SSL, podrías usar esta opción.
    }
});

pool.on('connect', () => {
    console.log('Conexión exitosa a PostgreSQL');
});

module.exports = pool;


pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error al ejecutar la consulta', err);
    } else {
        console.log('Consulta exitosa:', res.rows);
    }
});
