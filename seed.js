import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
    try {
        await pool.query(`
      INSERT INTO maestros (id, nombre, especialidad, activo) VALUES 
      ('m101', 'Juan Pérez', 'g1', true),
      ('m102', 'María García', 'g2', true),
      ('m103', 'Carlos Ruiz', 'g3', true),
      ('m104', 'Ana López', 'g1', true),
      ('m105', 'Pedro Picapiedra', 'g2', true),
      ('m106', 'Sara Connor', 'g3', true)
      ON CONFLICT (id) DO NOTHING;
    `);

        await pool.query(`
      INSERT INTO programacion (id, fecha, leccion_titulo, leccion_pasaje, leccion_enfasis, leccion_teologia, maestro_3_7, maestro_8_11, maestro_adolescentes) VALUES 
      ('clase_1', '2026-03-15', 'El Arca de Noé', 'Génesis 6:9-22', 'La fidelidad de Dios y la obediencia radical de Noé ante un mundo difícil.', 'El arca no es solo un barco, es un tipo de Cristo que nos salva del juicio. Debemos enfatizar la gracia soberana de Dios que provee un camino de escape...', 'm101', 'm102', 'm103'),
      ('clase_2', '2026-03-22', 'David y Goliat', '1 Samuel 17', 'Nuestra confianza no está en nuestra fuerza, sino en el nombre del Señor de los ejércitos.', 'David actúa como el mediador y campeón de su pueblo. No somos David, somos los israelitas asustados; Cristo es nuestro David que vence al gigante del pecado.', 'm104', 'm105', 'm106')
      ON CONFLICT (id) DO NOTHING;
    `);

        console.log('Seed data inserted successfully.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
