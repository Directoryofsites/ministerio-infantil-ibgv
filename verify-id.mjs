async function verify() {
    const id = 'clase_1';
    try {
        console.log(`>>> Probando GET /api/ministerio para ver si ${id} está presente...`);
        const resList = await fetch('http://localhost:3001/api/ministerio');
        const data = await resList.json();
        const found = data.ministerio_infantil.programacion.find(p => p.id === id);
        console.log(`>>> Encontrado en lista: ${JSON.stringify(found)}`);

        console.log(`>>> Probando DELETE http://localhost:3001/api/programacion/${id} (Simulado, no borraremos si es exitoso o solo veremos el status)...`);
        // No queremos borrar datos reales del usuario si no es necesario, pero el 404 es lo que buscamos.
        // Podemos usar un ID inexistente para ver si responde 404 o algo más.
        const resNotFound = await fetch('http://localhost:3001/api/programacion/non-existent-id', { method: 'DELETE' });
        console.log(`>>> Status para ID inexistente: ${resNotFound.status}`);

        const resFound = await fetch(`http://localhost:3001/api/programacion/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fecha: '2026-03-15', leccion: { titulo: 'Test' }, asignaciones: {} }) });
        console.log(`>>> Status para ${id} (PUT): ${resFound.status}`);
        if (resFound.status === 404) {
            const errorData = await resFound.json();
            console.log(`>>> Error del servidor:`, errorData);
        }

    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}
verify();
