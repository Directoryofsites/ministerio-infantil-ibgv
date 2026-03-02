async function verifyProxy() {
    const id = 'clase_1';
    try {
        console.log(`>>> Probando GET a través del PROXY (puerto 5173)...`);
        const resList = await fetch('http://localhost:5173/api/ministerio');
        console.log(`>>> Status PROXY (GET): ${resList.status}`);

        const resPut = await fetch(`http://localhost:5173/api/programacion/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fecha: '2026-03-15', leccion: { titulo: 'Test Proxy' }, asignaciones: {} })
        });
        console.log(`>>> Status PROXY (PUT): ${resPut.status}`);

    } catch (err) {
        console.error("Proxy Fetch Error:", err.message);
    }
}
verifyProxy();
