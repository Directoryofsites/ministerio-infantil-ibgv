import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const rawData = `
    1. SARA RINCON VALENCIA	4 AÑOS	17 DE JUNIO	ANGELA MARIA	3147427164
    2. ALIX CASTIBLANCO	6 AÑOS	21 DE ENERO	NATALY	3225914316
    3. SYMON ESPINOZA 	7 AÑOS	08 DE AGOSTO	JEYMY	3114345496
    4. CATALEIA	5 AÑOS	28 SEPTIMBRE	DORITA	3183537907
    5. JERONIMO SANTAMARIA	7 AÑOS	20 FEBRERO	FERNANDA	3125416257
    6. JACOBO SANTAMARIA	5 AÑOS	9 DE DICIEMBRE	FERNANDA	3125416257
    7. LUCIA RIOS	6 AÑOS 	25 DE JULIO	HAYDI FRANCO	3112611614
    8. VALENTINA GARCIA	6 AÑOS	19 DE JULIO	LAURA FRANCO	3217206729
    9. LAURA RODRIGUEZ	7 AÑOS	20 DE ABRIL	BRENDA ROJAS	3508490672
    10. ESTEBAN	8 AÑOS	11 DE MARZO	JULIANA	3207111835
    11. ARON	9 AÑOS	1 DE ABRIL	NATALY	3225914316
    12. MARIA JOSE	9 AÑOS	14 DE ENERO	LEIDI JHOANA	3175901213
    13. CRISTOFER CORREA	11 AÑOS	3 DE JUNIO	JENNY	3146219176
    14. MATIAS TORRES	11 AÑOS	13 DE AGOSTO	SANDRA	3009833787
    15. SAMUEL PANESO	19 AÑOS	20 DE FEBRERO	ANGELA	3205742251
    16. SAMANTA ESPINOZA	9 AÑOS	27 DE JUNIO	JEIMY	3114345496
    17. SEBASTIAN TORRES	10 AÑOS	11 DE NOVIEMBRE	ALBA ABUELA	3174703082
    18. JUAN ESTEBAN SALAZAR	10 AÑOS	14 DEDICIEMBRE	MONICA	3175734961
    19. DANIELA FLORES	11 AÑOS	7 DE FEBRERO	JOHANA	3226433113
    20. SAMARA SALAZAR	11 AÑOS	12 DE MARZO	MONICA	3175734961
    21. DAVID RODRIGUEZ	10 AÑOS	11 DE ABRIL	BRENDA ROJAS	3508490672
    22. ANA LUCIA VARGAS	9 AÑOS	10 DE MARZO	NICOL CAMACHO	3058189573
    23. JUAN ANDRES MUÑOS 	11 AÑOS	06 SEPTIEMBRE	LEIDI MADRE SUSTITUTA	3175901213
    24. MICHAEL DAVID	10 AÑOS	10 DE AGOSTO	LEIDI MADRE SUSTITUTA	3175901213
    25. SAMUEL A. GONZALEZ	16 AÑOS	10 DE DICIEMBRE	BETTY ABUELA	3217653536
    26. GABRIELA FRANCO	13 AÑOS 	18 DE NOVIEMBRE	JULIANA	3207111835
    27. CRISTAL CASTIBLANCO	14 AÑOS	01 DE FEBRERO	NATALY	3225914316
    28. ESTEBAN MARTINEZ	16 AÑOS	18 DE ABRIL	CESAR	3168264761
    29. TIMOTEO DURAN	13 AÑOS	02 DE AGOSTO	DORITA	3183537907
    30. DANTE DIAZ	12 AÑOS	18 DE SEPTIEMBRE	ROCIO	3127282452
    31. VALERIA FLORES	16 AÑOS	06 DE MAYO	JOHANA	3226433113
    32. NIKOL 	17 AÑOS	09 DE NOVIEMBRE		
    33. SAMUEL ESPINOZA	16 AÑOS	08 DE NOVIEMBRE	JEIMY	3114345496
    34. ORIANA SALAZAR	16 AÑOS	18 DE DICIEMBRE	MONICA	3177534961
    35. MARIA JOSE FLORES	14 AÑOS	08 DE OCTUBRE	JOHANA	3226433113
    36. SILVANA	13 AÑOS	30 DE JUNIO	NICOLL CAMACHO	3058189573
    37. JOHAN DAVID LEAL	13 AÑOS	01 DE ENERO 	LEIDI MADRE SUSTITUTA	3175901213
`;

const getGroupFromAge = (ageStr) => {
    const ageMatch = ageStr.match(/\d+/);
    if (!ageMatch) return null;
    const age = parseInt(ageMatch[0]);
    if (age <= 7) return 'g1';
    if (age >= 8 && age <= 11) return 'g2';
    if (age >= 12) return 'g3';
    return null;
};

const run = async () => {
    try {
        await pool.query('ALTER TABLE estudiantes ALTER COLUMN cumpleanos TYPE VARCHAR(50);');
        console.log("Columna cumpleanos cambiada a VARCHAR(50) con éxito.");
    } catch (e) {
        console.log("No se pudo alterar la columna, quizás ya es VARCHAR: ", e.message);
    }

    try {
        const lines = rawData.split('\n').map(l => l.trim()).filter(Boolean);
        let inserted = 0;

        for (const line of lines) {
            const cleanLine = line.replace(/^\d+\.\s*/, '');
            const parts = cleanLine.split(/\s{2,}|\t+/);

            if (parts.length < 3) continue;

            const nombre = parts[0].trim();
            const edadStr = parts[1].trim();
            const cumpleanos = parts[2].trim().toLowerCase().replace(' de ', ' de ');

            const finalCumple = cumpleanos.split(' ').map(word => {
                if (word.toLowerCase() === 'de') return 'de';
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');

            let acudiente = '';
            let whatsapp = '';

            if (parts.length >= 5) {
                acudiente = parts[3].trim();
                whatsapp = parts[4].trim();
            } else if (parts.length === 4) {
                const p4 = parts[3].trim();
                if (/^\d+$/.test(p4.replace(/\s/g, ''))) {
                    whatsapp = p4;
                } else {
                    acudiente = p4;
                }
            }

            const grupo = getGroupFromAge(edadStr) || '';
            const observaciones = acudiente ? `Edad registrada: ${edadStr} | Acudiente: ${acudiente}` : `Edad registrada: ${edadStr}`;

            const id = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            console.log(`Insertando: ${nombre} | ${finalCumple} | Grupos: ${grupo} | Ws: ${whatsapp} | Obs: ${observaciones}`);

            await pool.query(
                `INSERT INTO estudiantes (id, nombre, grupo, cumpleanos, whatsapp_padres, activo, observaciones)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, nombre, grupo, finalCumple, whatsapp || null, true, observaciones]
            );
            inserted++;
        }

        console.log(`\n\n>>> EXITO: ${inserted} estudiantes insertados.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
};

run();
