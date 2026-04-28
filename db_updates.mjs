import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Migrando base de datos...");

        // 1. Modificar tabla programacion
        await pool.query(`
            ALTER TABLE programacion 
            ADD COLUMN IF NOT EXISTS archivo_pdf_datos BYTEA,
            ADD COLUMN IF NOT EXISTS archivo_pdf_nombre VARCHAR(255);
        `);
        console.log("Columnas de PDF añadidas a programacion.");

        // 2. Crear tabla reuniones
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reuniones (
                id VARCHAR(255) PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                fecha DATE NOT NULL,
                hora VARCHAR(50),
                enlace VARCHAR(1000),
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tabla de reuniones creada.");

        console.log("Exito!");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
