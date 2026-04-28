import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
    try {
        await pool.query('CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, password VARCHAR(255))');
        await pool.query("INSERT INTO usuarios (username, password) VALUES ('admin', 'adminibgv') ON CONFLICT (username) DO NOTHING");
        const res = await pool.query('SELECT username FROM usuarios');
        console.log('Usuarios en la base de datos:', res.rows);
    } catch (err) {
        console.error('Error seeding DB:', err);
    } finally {
        await pool.end();
    }
}

seed();
