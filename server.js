import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Inicialización de DB
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS maestros (
                id TEXT PRIMARY KEY,
                nombre TEXT NOT NULL,
                especialidad TEXT,
                activo BOOLEAN DEFAULT true,
                foto_url TEXT,
                rol VARCHAR(20) DEFAULT 'Invitado',
                pin VARCHAR(4)
            )
        `);

        // Migration step: Make sure existing db has the rol and pin columns
        await pool.query(`ALTER TABLE maestros ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'Invitado'`);
        await pool.query(`ALTER TABLE maestros ADD COLUMN IF NOT EXISTS pin VARCHAR(4)`);
        await pool.query(`ALTER TABLE maestros ADD COLUMN IF NOT EXISTS foto_url TEXT`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS programacion (
                id TEXT PRIMARY KEY,
                fecha DATE NOT NULL,
                leccion_titulo TEXT,
                leccion_pasaje TEXT,
                leccion_enfasis TEXT,
                leccion_teologia TEXT,
                maestro_3_7 TEXT REFERENCES maestros(id),
                maestro_8_11 TEXT REFERENCES maestros(id),
                maestro_adolescentes TEXT REFERENCES maestros(id),
                observaciones TEXT
            )
        `);

        // Migration step: PDF and Word columns if they don't exist
        await pool.query(`ALTER TABLE programacion ADD COLUMN IF NOT EXISTS archivo_pdf_datos BYTEA`);
        await pool.query(`ALTER TABLE programacion ADD COLUMN IF NOT EXISTS archivo_pdf_nombre VARCHAR(255)`);
        await pool.query(`ALTER TABLE programacion ADD COLUMN IF NOT EXISTS archivo_word_datos BYTEA`);
        await pool.query(`ALTER TABLE programacion ADD COLUMN IF NOT EXISTS archivo_word_nombre VARCHAR(255)`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS estudiantes(
                id TEXT PRIMARY KEY,
                nombre TEXT NOT NULL,
                grupo TEXT,
                cumpleanos VARCHAR(50),
                whatsapp_padres TEXT,
                activo BOOLEAN DEFAULT true,
                observaciones TEXT
            )
        `);

        // Migration step: Cast cumpleanos to varchar if it was DATE
        await pool.query(`
            DO $$
        BEGIN 
                ALTER TABLE estudiantes ALTER COLUMN cumpleanos TYPE VARCHAR(50) USING cumpleanos:: varchar;
        EXCEPTION 
                WHEN others THEN
        --Si hay error(eg.por datos incompatibles), no hacer nada y seguir.
            NULL; 
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios(
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            password VARCHAR(255)
        )
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS asistencia(
                id SERIAL PRIMARY KEY,
                estudiante_id TEXT REFERENCES estudiantes(id),
                programacion_id TEXT REFERENCES programacion(id),
                presente BOOLEAN DEFAULT true,
                fecha DATE NOT NULL,
                UNIQUE(estudiante_id, programacion_id)
            )
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bitacora(
                id SERIAL PRIMARY KEY,
                programacion_id TEXT REFERENCES programacion(id),
                maestro_id TEXT REFERENCES maestros(id),
                observacion TEXT,
                formato_word_datos BYTEA,
                formato_word_nombre TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(programacion_id, maestro_id)
            )
        `);

        // Agregar columnas si la tabla ya existe (migración)
        await pool.query(`ALTER TABLE bitacora ADD COLUMN IF NOT EXISTS formato_word_datos BYTEA`);
        await pool.query(`ALTER TABLE bitacora ADD COLUMN IF NOT EXISTS formato_word_nombre TEXT`);

        // Seed inicial de grupos de edad si la tabla se usara como config
        await pool.query(`CREATE TABLE IF NOT EXISTS grupos_edad(id TEXT PRIMARY KEY, nombre TEXT)`);
        const count = await pool.query('SELECT count(*) FROM grupos_edad');
        if (parseInt(count.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO grupos_edad(id, nombre) VALUES
            ('g1', 'Niños 3-7 años'),
            ('g2', 'Niños 8-11 años'),
            ('g3', 'Adolescentes')
                `);
            console.log('>>> Grupos de edad inicializados.');
        }
        // Limpieza de IDs con espacios accidentales (Tarea única para corregir datos viejos)
        await pool.query(`
            UPDATE estudiantes SET id = TRIM(id);
            UPDATE maestros SET id = TRIM(id);
            UPDATE asistencia SET estudiante_id = TRIM(estudiante_id);
            UPDATE bitacora SET maestro_id = TRIM(maestro_id);
        `);

        console.log('✓ Esquema de Base de Datos listo y datos normalizados.');
    } catch (err) {
        console.error('!!! Error en initDb:', err);
    }
};

initDb();

// --- RUTAS ---

// Ruta ligera para mantener el servidor despierto (Keep-alive)
app.get('/api/ping', (req, res) => {
    res.json({ status: 'alive', time: new Date().toISOString() });
});

app.get('/api/ministerio', async (req, res) => {
    try {
        const gruposRes = await pool.query('SELECT * FROM grupos_edad');
        const maestrosRes = await pool.query('SELECT * FROM maestros');

        const reunionesRes = await pool.query('SELECT * FROM reuniones ORDER BY fecha ASC');

        const progRes = await pool.query(`
        SELECT
        p.id, p.fecha, p.leccion_titulo, p.leccion_pasaje, p.leccion_enfasis, p.leccion_teologia,
            p.maestro_3_7, p.maestro_8_11, p.maestro_adolescentes, p.observaciones,
            p.archivo_pdf_nombre,
            p.archivo_word_nombre,
            m1.nombre as m_nombre_1,
            m2.nombre as m_nombre_2,
            m3.nombre as m_nombre_3
            FROM programacion p
            LEFT JOIN maestros m1 ON p.maestro_3_7 = m1.id
            LEFT JOIN maestros m2 ON p.maestro_8_11 = m2.id
            LEFT JOIN maestros m3 ON p.maestro_adolescentes = m3.id
            ORDER BY p.fecha ASC
        `);

        const responseJSON = {
            ministerio_infantil: {
                iglesia: "IBGV - Escuela Infantil",
                configuracion: {
                    grupos_edad: gruposRes.rows.map(g => ({ id: g.id, nombre: g.nombre }))
                },
                maestros: maestrosRes.rows.map(m => ({
                    id: m.id, nombre: m.nombre, especialidad: m.especialidad, activo: m.activo, foto_url: m.foto_url, rol: m.rol || 'Invitado', pin: m.pin
                })),
                reuniones: reunionesRes.rows.map(r => ({
                    id: r.id, titulo: r.titulo, tipo: r.tipo, fecha: r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : null, hora: r.hora, enlace: r.enlace, descripcion: r.descripcion
                })),
                programacion: progRes.rows.map(p => ({
                    id: p.id,
                    fecha: new Date(p.fecha).toISOString().split('T')[0],
                    leccion: {
                        titulo: p.leccion_titulo,
                        pasaje_biblico: p.leccion_pasaje,
                        enfasis_principal: p.leccion_enfasis,
                        teologia_preparacion: p.leccion_teologia
                    },
                    maestros: {
                        ninos_pequenos: p.m_nombre_1 || (p.maestro_3_7 ? '?' : 'Sin asignar'),
                        ninos_grandes: p.m_nombre_2 || (p.maestro_8_11 ? '?' : 'Sin asignar'),
                        adolescentes: p.m_nombre_3 || (p.maestro_adolescentes ? '?' : 'Sin asignar')
                    },
                    rawAsignaciones: {
                        maestro_3_7: p.maestro_3_7,
                        maestro_8_11: p.maestro_8_11,
                        maestro_adolescentes: p.maestro_adolescentes
                    },
                    rawFecha: p.fecha,
                    observaciones: p.observaciones || '',
                    tiene_pdf: !!p.archivo_pdf_nombre,
                    pdf_nombre: p.archivo_pdf_nombre || null,
                    tiene_word: !!p.archivo_word_nombre,
                    word_nombre: p.archivo_word_nombre || null
                }))
            }
        };

        const estudiantesRes = await pool.query('SELECT * FROM estudiantes ORDER BY nombre ASC');
        responseJSON.ministerio_infantil.estudiantes = estudiantesRes.rows.map(e => ({
            id: e.id,
            nombre: e.nombre,
            grupo: e.grupo,
            cumpleanos: e.cumpleanos,
            whatsapp_padres: e.whatsapp_padres,
            activo: e.activo,
            observaciones: e.observaciones
        }));

        res.json(responseJSON);
    } catch (err) {
        console.error("!!! Error GET /api/ministerio:", err);
        res.status(500).json({ error: 'Server error retrieving data' });
    }
});

app.post('/api/programacion', async (req, res) => {
    const { id, fecha, leccion, asignaciones } = req.body;
    try {
        await pool.query(
            `INSERT INTO programacion
            (id, fecha, leccion_titulo, leccion_pasaje, leccion_enfasis, leccion_teologia, maestro_3_7, maestro_8_11, maestro_adolescentes)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                id, fecha,
                leccion.titulo, leccion.pasaje_biblico, leccion.enfasis_principal, leccion.teologia_preparacion,
                asignaciones.maestro_3_7 || null, asignaciones.maestro_8_11 || null, asignaciones.maestro_adolescentes || null
            ]
        );
        res.json({ success: true, message: 'Clase guardada' });
    } catch (err) {
        console.error("!!! Error POST /api/programacion:", err);
        res.status(500).json({ error: 'Server error scheduling', details: err.message });
    }
});

app.put('/api/programacion/:id', async (req, res) => {
    const id = req.params.id.trim();
    const { fecha, leccion, asignaciones } = req.body;
    console.log(`>>> PROCESANDO ACTUALIZACION(PUT) PARA ID: [${id}]`);
    try {
        const result = await pool.query(
            `UPDATE programacion SET
        fecha = $1, leccion_titulo = $2, leccion_pasaje = $3, leccion_enfasis = $4, leccion_teologia = $5,
            maestro_3_7 = $6, maestro_8_11 = $7, maestro_adolescentes = $8, observaciones = $9
             WHERE id = $10`,
            [
                fecha,
                leccion.titulo, leccion.pasaje_biblico, leccion.enfasis_principal, leccion.teologia_preparacion,
                asignaciones.maestro_3_7 || null, asignaciones.maestro_8_11 || null, asignaciones.maestro_adolescentes || null,
                req.body.observaciones || null,
                id
            ]
        );
        if (result.rowCount === 0) {
            console.warn(`!!! NO SE ENCONTRO LA CLASE CON ID: [${id}]`);
            return res.status(404).json({ error: 'Clase no encontrada' });
        }
        res.json({ success: true, message: 'Clase actualizada' });
    } catch (err) {
        console.error("!!! Error PUT /api/programacion:", err);
        res.status(500).json({ error: 'Server error updating', details: err.message });
    }
});

app.put('/api/programacion/:id/observaciones', async (req, res) => {
    const id = req.params.id.trim();
    const { observaciones } = req.body;
    try {
        const result = await pool.query('UPDATE programacion SET observaciones = $1 WHERE id = $2', [observaciones, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'No se encontro la clase' });
        res.json({ success: true });
    } catch (err) {
        console.error("!!! Error UPDATE observaciones:", err);
        res.status(500).json({ error: 'Error al guardar observaciones' });
    }
});

app.delete('/api/programacion/:id', async (req, res) => {
    const id = req.params.id.trim();
    console.log(`>>> PROCESANDO ELIMINACION(DELETE) PARA ID: [${id}]`);
    try {
        // Primero eliminar registros relacionados para evitar error de llave foránea
        await pool.query('DELETE FROM asistencia WHERE programacion_id = $1', [id]);
        await pool.query('DELETE FROM bitacora WHERE programacion_id = $1', [id]);

        const result = await pool.query('DELETE FROM programacion WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.warn(`!!! NO SE ENCONTRO LA CLASE PARA ELIMINAR CON ID: [${id}]`);
            return res.status(404).json({ error: 'Clase no encontrada' });
        }
        res.json({ success: true, message: 'Clase eliminada' });
    } catch (err) {
        console.error("!!! Error DELETE /api/programacion:", err);
        res.status(500).json({ error: 'Server error deleting', details: err.message });
    }
});
// --- RUTAS PDF PROGRAMACION ---
app.post('/api/programacion/:id/pdf', async (req, res) => {
    const id = req.params.id.trim();
    const { pdf_base64, pdf_nombre } = req.body;
    try {
        if (!pdf_base64 || !pdf_nombre) return res.status(400).json({ error: 'Faltan datos del PDF' });

        const base64Data = pdf_base64.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        await pool.query('UPDATE programacion SET archivo_pdf_datos = $1, archivo_pdf_nombre = $2 WHERE id = $3', [buffer, pdf_nombre, id]);
        res.json({ success: true, message: 'PDF guardado exitosamente' });
    } catch (err) {
        console.error("!!! Error POST /api/programacion/:id/pdf:", err);
        res.status(500).json({ error: 'Error al subir PDF' });
    }
});
app.delete('/api/programacion/:id/pdf', async (req, res) => {
    const id = req.params.id.trim();
    try {
        await pool.query('UPDATE programacion SET archivo_pdf_datos = NULL, archivo_pdf_nombre = NULL WHERE id = $1', [id]);
        res.json({ success: true, message: 'PDF eliminado' });
    } catch (err) {
        console.error("!!! Error DELETE /api/programacion/:id/pdf:", err);
        res.status(500).json({ error: 'Error al eliminar PDF' });
    }
});
app.get('/api/programacion/:id/pdf', async (req, res) => {
    const id = req.params.id.trim();
    try {
        const result = await pool.query('SELECT archivo_pdf_datos, archivo_pdf_nombre FROM programacion WHERE id = $1', [id]);
        if (result.rowCount === 0 || !result.rows[0].archivo_pdf_datos) {
            return res.status(404).json({ error: 'PDF no encontrado' });
        }
        const file = result.rows[0];
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${file.archivo_pdf_nombre}"`);
        res.send(file.archivo_pdf_datos);
    } catch (err) {
        console.error("!!! Error GET /api/programacion/:id/pdf:", err);
        res.status(500).json({ error: 'Error al descargar PDF' });
    }
});

// --- RUTAS WORD PROGRAMACION ---
app.post('/api/programacion/:id/word', async (req, res) => {
    const id = req.params.id.trim();
    const { word_base64, word_nombre } = req.body;
    try {
        if (!word_base64 || !word_nombre) return res.status(400).json({ error: 'Faltan datos del archivo' });

        const base64Data = word_base64.split(',')[1] || word_base64;
        const buffer = Buffer.from(base64Data, 'base64');

        await pool.query('UPDATE programacion SET archivo_word_datos = $1, archivo_word_nombre = $2 WHERE id = $3', [buffer, word_nombre, id]);
        res.json({ success: true, message: 'Planeación guardada exitosamente' });
    } catch (err) {
        console.error("!!! Error POST /api/programacion/:id/word:", err);
        res.status(500).json({ error: 'Error al subir planeación' });
    }
});
app.delete('/api/programacion/:id/word', async (req, res) => {
    const id = req.params.id.trim();
    try {
        await pool.query('UPDATE programacion SET archivo_word_datos = NULL, archivo_word_nombre = NULL WHERE id = $1', [id]);
        res.json({ success: true, message: 'Planeación eliminada' });
    } catch (err) {
        console.error("!!! Error DELETE /api/programacion/:id/word:", err);
        res.status(500).json({ error: 'Error al eliminar planeación' });
    }
});
app.get('/api/programacion/:id/word', async (req, res) => {
    const id = req.params.id.trim();
    try {
        const result = await pool.query('SELECT archivo_word_datos, archivo_word_nombre FROM programacion WHERE id = $1', [id]);
        if (result.rowCount === 0 || !result.rows[0].archivo_word_datos) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }
        const file = result.rows[0];
        // Set content type for Word (handling both doc and docx)
        const contentType = file.archivo_word_nombre.endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.archivo_word_nombre}"`);
        res.send(file.archivo_word_datos);
    } catch (err) {
        console.error("!!! Error GET /api/programacion/:id/word:", err);
        res.status(500).json({ error: 'Error al descargar planeación' });
    }
});

// --- RUTAS REUNIONES ---
app.post('/api/reuniones', async (req, res) => {
    const { id, titulo, tipo, fecha, hora, enlace, descripcion } = req.body;
    try {
        await pool.query(
            `INSERT INTO reuniones (id, titulo, tipo, fecha, hora, enlace, descripcion)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, titulo, tipo, fecha, hora || null, enlace || null, descripcion || null]
        );
        res.json({ success: true, message: 'Reunión creada' });
    } catch (err) {
        console.error("!!! Error POST /api/reuniones:", err);
        res.status(500).json({ error: 'Error al crear reunión', details: err.message });
    }
});
app.put('/api/reuniones/:id', async (req, res) => {
    const id = req.params.id.trim();
    const { titulo, tipo, fecha, hora, enlace, descripcion } = req.body;
    try {
        await pool.query(
            `UPDATE reuniones SET titulo = $1, tipo = $2, fecha = $3, hora = $4, enlace = $5, descripcion = $6 WHERE id = $7`,
            [titulo, tipo, fecha, hora || null, enlace || null, descripcion || null, id]
        );
        res.json({ success: true, message: 'Reunión actualizada' });
    } catch (err) {
        console.error("!!! Error PUT /api/reuniones:", err);
        res.status(500).json({ error: 'Error al actualizar reunión' });
    }
});
app.delete('/api/reuniones/:id', async (req, res) => {
    const id = req.params.id.trim();
    try {
        await pool.query('DELETE FROM reuniones WHERE id = $1', [id]);
        res.json({ success: true, message: 'Reunión eliminada' });
    } catch (err) {
        console.error("!!! Error DELETE /api/reuniones:", err);
        res.status(500).json({ error: 'Error al eliminar reunión' });
    }
});

// --- RUTAS ESTUDIANTES ---

app.post('/api/estudiantes', async (req, res) => {
    const { id, nombre, grupo, cumpleanos, whatsapp_padres, activo, observaciones } = req.body;
    try {
        await pool.query(
            `INSERT INTO estudiantes(id, nombre, grupo, cumpleanos, whatsapp_padres, activo, observaciones)
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
            [id || `e - ${Date.now()}`, nombre, grupo, cumpleanos || null, whatsapp_padres || null, activo !== undefined ? activo : true, observaciones || null]
        );
        res.json({ success: true, message: 'Estudiante creado' });
    } catch (err) {
        console.error("!!! Error POST /api/estudiantes:", err);
        res.status(500).json({ error: 'Error al crear estudiante', details: err.message });
    }
});

app.put('/api/estudiantes/:id', async (req, res) => {
    const id = req.params.id.trim();
    const { nombre, grupo, cumpleanos, whatsapp_padres, activo, observaciones } = req.body;
    try {
        const result = await pool.query(
            `UPDATE estudiantes SET nombre = $1, grupo = $2, cumpleanos = $3, whatsapp_padres = $4, activo = $5, observaciones = $6 WHERE id = $7`,
            [nombre, grupo, cumpleanos || null, whatsapp_padres || null, activo, observaciones || null, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
        res.json({ success: true, message: 'Estudiante actualizado' });
    } catch (err) {
        console.error("!!! Error PUT /api/estudiantes:", err);
        res.status(500).json({ error: 'Error al actualizar estudiante', details: err.message });
    }
});

app.delete('/api/estudiantes/:id', async (req, res) => {
    const id = req.params.id.trim();
    try {
        // Primero eliminar registros relacionados en asistencia
        await pool.query('DELETE FROM asistencia WHERE estudiante_id = $1', [id]);

        const result = await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
        res.json({ success: true, message: 'Estudiante eliminado' });
    } catch (err) {
        console.error("!!! Error DELETE /api/estudiantes:", err);
        res.status(500).json({ error: 'Error al eliminar estudiante' });
    }
});

// --- RUTAS MAESTROS ---

app.post('/api/maestros', async (req, res) => {
    const { id, nombre, especialidad, activo, foto_url, rol, pin } = req.body;
    console.log(`>>> CREANDO MAESTRO: [${nombre}] ROL: [${rol || 'Invitado'}] CON FOTO: [${foto_url || 'SIN FOTO'}]`);
    try {
        await pool.query(
            `INSERT INTO maestros(id, nombre, especialidad, activo, foto_url, rol, pin) VALUES($1, $2, $3, $4, $5, $6, $7)`,
            [id || `m - ${Date.now()}`, nombre, especialidad, activo !== undefined ? activo : true, foto_url || null, rol || 'Invitado', pin || null]
        );
        res.json({ success: true, message: 'Maestro creado' });
    } catch (err) {
        console.error("!!! Error POST /api/maestros:", err);
        res.status(500).json({ error: 'Server error creating teacher', details: err.message });
    }
});

app.put('/api/maestros/:id', async (req, res) => {
    const id = req.params.id.trim();
    const { nombre, especialidad, activo, foto_url, rol, pin } = req.body;
    console.log(`>>> ACTUALIZANDO MAESTRO ID: [${id}] NOMBRE: [${nombre}] ROL: [${rol}] CON FOTO: [${foto_url || 'SIN FOTO'}]`);
    try {
        const result = await pool.query(
            `UPDATE maestros SET nombre = $1, especialidad = $2, activo = $3, foto_url = $4, rol = $5, pin = $6 WHERE id = $7`,
            [nombre, especialidad, activo, foto_url || null, rol || 'Invitado', pin || null, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Maestro no encontrado' });
        res.json({ success: true, message: 'Maestro actualizado' });
    } catch (err) {
        console.error("!!! Error PUT /api/maestros:", err);
        res.status(500).json({ error: 'Server error updating teacher', details: err.message });
    }
});

app.delete('/api/maestros/:id', async (req, res) => {
    const id = req.params.id.trim();
    try {
        const result = await pool.query('DELETE FROM maestros WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Maestro no encontrado' });
        res.json({ success: true, message: 'Maestro eliminado' });
    } catch (err) {
        console.error("!!! Error DELETE /api/maestros:", err);
        res.status(500).json({ error: 'Server error deleting teacher', details: err.message });
    }
});

// --- RUTAS AUTENTICACION ---

app.post('/api/login', async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, isAdmin: true });
        } else {
            res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error("!!! Error POST /api/login:", err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- RUTAS ASISTENCIA ---

app.get('/api/asistencia/estadisticas/estudiantes', async (req, res) => {
    try {
        const result = await pool.query(`
SELECT
estudiante_id,
    COUNT(*) FILTER(WHERE presente = true) as asistencias,
        COUNT(*) as total_clases
            FROM asistencia
            GROUP BY estudiante_id
    `);
        res.json(result.rows);
    } catch (err) {
        console.error("!!! Error GET stats asistencia:", err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

app.get('/api/asistencia/estudiante/:id', async (req, res) => {
    const estudianteId = req.params.id;
    try {
        const result = await pool.query(`
SELECT
a.presente,
    a.fecha,
    p.leccion_titulo 
            FROM asistencia a
            JOIN programacion p ON a.programacion_id = p.id
            WHERE a.estudiante_id = $1
            ORDER BY a.fecha DESC
    `, [estudianteId]);
        res.json(result.rows);
    } catch (err) {
        console.error(`!!! Error GET asistencia detalle estudiante ${estudianteId}: `, err);
        res.status(500).json({ error: 'Error al obtener detalle de asistencia' });
    }
});

app.get('/api/asistencia/:programacion_id', async (req, res) => {
    const { programacion_id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM asistencia WHERE programacion_id = $1', [programacion_id]);
        res.json(result.rows);
    } catch (err) {
        console.error("!!! Error GET /api/asistencia:", err);
        res.status(500).json({ error: 'Error al obtener asistencia' });
    }
});

app.post('/api/asistencia', async (req, res) => {
    const { programacion_id, asistencias } = req.body;
    try {
        for (const asis of asistencias) {
            await pool.query(
                `INSERT INTO asistencia(estudiante_id, programacion_id, presente, fecha)
VALUES($1, $2, $3, $4)
                 ON CONFLICT(estudiante_id, programacion_id)
                 DO UPDATE SET presente = EXCLUDED.presente`,
                [asis.estudiante_id, programacion_id, asis.presente, asis.fecha]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error("!!! Error POST /api/asistencia:", err);
        res.status(500).json({ error: 'Error al guardar asistencia' });
    }
});

// --- RUTAS BITACORA ---

app.get('/api/bitacora/:programacion_id/:maestro_id', async (req, res) => {
    const { programacion_id, maestro_id } = req.params;
    try {
        const result = await pool.query(
            'SELECT observacion FROM bitacora WHERE programacion_id = $1 AND maestro_id = $2',
            [programacion_id, maestro_id]
        );
        res.json(result.rows[0] || { observacion: '' });
    } catch (err) {
        console.error("!!! Error GET /api/bitacora:", err);
        res.status(500).json({ error: 'Error al obtener bitácora' });
    }
});

app.post('/api/bitacora', async (req, res) => {
    const { programacion_id, maestro_id, observacion } = req.body;
    try {
        await pool.query(
            `INSERT INTO bitacora(programacion_id, maestro_id, observacion)
VALUES($1, $2, $3)
             ON CONFLICT(programacion_id, maestro_id)
             DO UPDATE SET observacion = EXCLUDED.observacion`,
            [programacion_id, maestro_id, observacion]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("!!! Error POST /api/bitacora:", err);
        res.status(500).json({ error: 'Error al guardar bitácora' });
    }
});

// --- RUTAS FORMATO REPORTE (WORD) ---

app.post('/api/bitacora/formato', async (req, res) => {
    const { programacion_id, maestro_id, formato_base64, formato_nombre } = req.body;
    try {
        if (!formato_base64 || !formato_nombre) return res.status(400).json({ error: 'Faltan datos del archivo' });

        const base64Data = formato_base64.split(',')[1] || formato_base64;
        const buffer = Buffer.from(base64Data, 'base64');

        await pool.query(
            `INSERT INTO bitacora(programacion_id, maestro_id, formato_word_datos, formato_word_nombre)
             VALUES($1, $2, $3, $4)
             ON CONFLICT(programacion_id, maestro_id)
             DO UPDATE SET formato_word_datos = EXCLUDED.formato_word_datos, 
                           formato_word_nombre = EXCLUDED.formato_word_nombre`,
            [programacion_id, maestro_id, buffer, formato_nombre]
        );
        res.json({ success: true, message: 'Formato guardado exitosamente' });
    } catch (err) {
        console.error("!!! Error POST /api/bitacora/formato:", err);
        res.status(500).json({ error: 'Error al subir formato' });
    }
});

app.get('/api/bitacora/formatos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id, b.programacion_id, b.maestro_id, b.formato_word_nombre, b.fecha_creacion,
                m.nombre as maestro_nombre,
                p.fecha as leccion_fecha, p.leccion_titulo
            FROM bitacora b
            JOIN maestros m ON b.maestro_id = m.id
            JOIN programacion p ON b.programacion_id = p.id
            WHERE b.formato_word_datos IS NOT NULL
            ORDER BY p.fecha DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("!!! Error GET /api/bitacora/formatos:", err);
        res.status(500).json({ error: 'Error al obtener formatos' });
    }
});

app.get('/api/bitacora/:id/formato/descargar', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT formato_word_datos, formato_word_nombre FROM bitacora WHERE id = $1', [id]);
        if (result.rowCount === 0 || !result.rows[0].formato_word_datos) {
            return res.status(404).json({ error: 'Formato no encontrado' });
        }
        const file = result.rows[0];
        const contentType = file.formato_word_nombre.endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/msword';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.formato_word_nombre}"`);
        res.send(file.formato_word_datos);
    } catch (err) {
        console.error("!!! Error GET /api/bitacora/:id/formato/descargar:", err);
        res.status(500).json({ error: 'Error al descargar formato' });
    }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log("=================================================");
    console.log(`🚀 API IBGV LISTA EN PUERTO: ${PORT} `);
    console.log("=================================================");
});
