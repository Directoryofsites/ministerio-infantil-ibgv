// using native fetch

async function testPost() {
    try {
        const payload = {
            id: 'test-' + Date.now(),
            fecha: '', // Simulating an empty date
            leccion: {
                titulo: 'Test Titulo',
                pasaje_biblico: '',
                enfasis_principal: '',
                teologia_preparacion: ''
            },
            asignaciones: {
                maestro_3_7: '',
                maestro_8_11: '',
                maestro_adolescentes: ''
            }
        };

        const res = await fetch('http://127.0.0.1:3001/api/programacion', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        const txt = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", txt);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testPost();
