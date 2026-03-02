import pkg from 'pg';
const { Pool } = pkg;

// Connect to local database (hardcoded for this script)
const localPool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/ibgv_ninos"
});

// Remote Neon DB connection
const remotePool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_HeA7Y0lSKWNk@ep-plain-heart-aioco12y-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false }
});

async function migrateData() {
    console.log("=== INICIANDO MIGRACIÓN DE DATOS LOCAL A NUBE ===");
    try {
        // Test local connection first
        await localPool.query("SELECT 1");
        console.log("✅ Conexión a BD local exitosa.");

        // 1. Maestros
        console.log("Migrando maestros...");
        const maestros = await localPool.query("SELECT * FROM maestros");
        for (let m of maestros.rows) {
            await remotePool.query(
                `INSERT INTO maestros (id, nombre, especialidad, activo, foto_url, rol, pin) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
                [m.id, m.nombre, m.especialidad, m.activo, m.foto_url, m.rol, m.pin]
            );
        }
        console.log(`✅ ${maestros.rowCount} maestros migrados.`);

        // 2. Programación (Classes)
        console.log("Migrando programación...");
        const programacion = await localPool.query("SELECT * FROM programacion");
        for (let p of programacion.rows) {
            await remotePool.query(
                `INSERT INTO programacion (id, fecha, leccion_titulo, leccion_pasaje, leccion_enfasis, leccion_teologia, maestro_3_7, maestro_8_11, maestro_adolescentes, observaciones) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
                [p.id, p.fecha, p.leccion_titulo, p.leccion_pasaje, p.leccion_enfasis, p.leccion_teologia, p.maestro_3_7, p.maestro_8_11, p.maestro_adolescentes, p.observaciones]
            );
        }
        console.log(`✅ ${programacion.rowCount} clases migradas.`);

        // 3. Estudiantes
        console.log("Migrando estudiantes...");
        const estudiantes = await localPool.query("SELECT * FROM estudiantes");
        for (let e of estudiantes.rows) {
            await remotePool.query(
                `INSERT INTO estudiantes (id, nombre, grupo, cumpleanos, nombre_padres, whatsapp_padres) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
                [e.id, e.nombre, e.grupo, e.cumpleanos, e.nombre_padres, e.whatsapp_padres]
            );
        }
        console.log(`✅ ${estudiantes.rowCount} estudiantes migrados.`);

        // 4. Asistencia
        console.log("Migrando asistencia...");
        const asistencia = await localPool.query("SELECT * FROM asistencia");
        for (let a of asistencia.rows) {
            await remotePool.query(
                `INSERT INTO asistencia (estudiante_id, programacion_id, presente, fecha) VALUES ($1, $2, $3, $4) ON CONFLICT (estudiante_id, programacion_id) DO NOTHING`,
                [a.estudiante_id, a.programacion_id, a.presente, a.fecha]
            );
        }
        console.log(`✅ ${asistencia.rowCount} registros de asistencia migrados.`);

        // 5. Bitácora
        console.log("Migrando bitácora...");
        const bitacora = await localPool.query("SELECT * FROM bitacora");
        for (let b of bitacora.rows) {
            await remotePool.query(
                `INSERT INTO bitacora (programacion_id, maestro_id, observacion) VALUES ($1, $2, $3) ON CONFLICT (programacion_id, maestro_id) DO NOTHING`,
                [b.programacion_id, b.maestro_id, b.observacion]
            );
        }
        console.log(`✅ ${bitacora.rowCount} notas de bitácora migradas.`);

        console.log("=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===");
    } catch (error) {
        console.error("❌ Error durante la migración:", error);
    } finally {
        await localPool.end();
        await remotePool.end();
    }
}

migrateData();
