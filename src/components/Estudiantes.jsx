import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Estudiantes = ({ estudiantes = [], onNavigate, onEditEstudiante, onNewEstudiante, isAdmin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [asistenciaStats, setAsistenciaStats] = useState([]);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('lista'); // 'lista' o 'cumpleanos'
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase());

    const exportExcel = () => {
        const sortedStudents = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Preparar los datos para Excel
        const data = sortedStudents.map((e, index) => ({
            '#': index + 1,
            'NOMBRE COMPLETO': e.nombre.toUpperCase(),
            'GRUPO': getGroupName(e.grupo),
            'CUMPLEAÑOS': e.cumpleanos || '',
            'WHATSAPP PADRES': e.whatsapp_padres || '',
            'HOJA DE VIDA / OBSERVACIONES': e.observaciones || ''
        }));

        // Crear libro y hoja
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Alumnos IBGV");

        // Ajustar anchos de columna automáticamente
        const wscols = [
            { wch: 5 },  // #
            { wch: 40 }, // Nombre
            { wch: 15 }, // Grupo
            { wch: 20 }, // Cumpleaños
            { wch: 20 }, // WhatsApp
            { wch: 60 }, // Observaciones
        ];
        ws['!cols'] = wscols;

        // Descargar archivo
        const fileName = `Alumnos_IBGV_${selectedGroup}_${new Date().toLocaleDateString()}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const exportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Orientación horizontal para que quepan bien las observaciones
        const now = new Date().toLocaleDateString('es-ES');
        const nowFull = new Date().toLocaleString('es-ES');

        // 1. Encabezado Institucional (Diseño Premium)
        doc.setFillColor(196, 30, 36); // Rojo Primario IBGV
        doc.rect(0, 0, 297, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("IGLESIA BÍBLICA GRACIA Y VIDA", 20, 18);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Ministerio Infantil - Directorio Oficial de Alumnos", 20, 26);
        
        const groupLabel = selectedGroup === 'all' ? "TODOS LOS GRUPOS" : getGroupName(selectedGroup).toUpperCase();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`REPORTE: ${groupLabel}`, 20, 32);

        if (viewMode === 'lista') {
            // Ordenar alfabéticamente para el PDF
            const sortedStudents = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));

            const tableData = sortedStudents.map((e, index) => [
                index + 1,
                e.nombre.toUpperCase(),
                getGroupName(e.grupo),
                e.cumpleanos || 'No reg.',
                e.whatsapp_padres || 'Sin contacto',
                e.observaciones || 'Sin observaciones en hoja de vida'
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['#', 'Nombre Completo', 'Grupo', 'Cumpleaños', 'WhatsApp Padres', 'Observaciones / Hoja de Vida']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [196, 30, 36], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
                styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 60, fontStyle: 'bold' },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 35 },
                    5: { cellWidth: 'auto' } // Las observaciones toman el espacio restante
                },
                didDrawPage: (data) => {
                    doc.setFontSize(8);
                    doc.setTextColor(150);
                    doc.text(`Generado el: ${nowFull} - Página ${data.pageNumber}`, 20, 200);
                }
            });

            doc.save(`Hojas_de_Vida_IBGV_${selectedGroup}_${now}.pdf`);
        } else {
            // Reporte de Cumpleaños (Mantiene diseño premium)
            const tableData = cumpleanosDelMes.map(e => [
                e.nombre.toUpperCase(),
                e.cumpleanos,
                e.whatsapp_padres || 'N/A',
                getGroupName(e.grupo)
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Alumno', 'Fecha de Cumpleaños', 'Contacto Padres', 'Grupo']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [196, 30, 36], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 5 }
            });

            doc.save(`Cumpleanos_IBGV_${selectedMonth.toUpperCase()}_${now}.pdf`);
        }
    };

    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    useEffect(() => {
        fetch('/api/asistencia/estadisticas/estudiantes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAsistenciaStats(data);
                } else {
                    setAsistenciaStats([]);
                }
            })
            .catch(err => {
                console.error("Error cargando estadísticas:", err);
                setAsistenciaStats([]);
            });
    }, []);

    const getAttendanceInfo = (estudianteId) => {
        const stats = (asistenciaStats || []).find(s => s.estudiante_id === estudianteId);
        if (!stats) return { label: 'Sin datos', color: 'bg-gray-100 text-gray-400', ratio: '0' };
        const count = parseInt(stats.asistencias) || 0;
        const total = parseInt(stats.total_clases) || 0;
        if (total === 0) return { label: 'Sin clases', color: 'bg-gray-100 text-gray-400', ratio: '0' };
        const percent = (count / total) * 100;
        if (percent >= 80) return { label: 'Excelente', color: 'bg-green-100 text-green-600', ratio: `${count}/${total}` };
        if (percent >= 50) return { label: 'Regular', color: 'bg-yellow-100 text-yellow-600', ratio: `${count}/${total}` };
        return { label: 'Alerta', color: 'bg-red-100 text-red-600', ratio: `${count}/${total}` };
    };

    const filtered = (estudiantes || []).filter(e => {
        const nombre = (e.nombre || '').toLowerCase();
        const matchesSearch = nombre.includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroup === 'all' || e.grupo === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    const cumpleanosDelMes = (estudiantes || []).filter(e => {
        if (!e.cumpleanos) return false;
        return e.cumpleanos.toLowerCase().includes(selectedMonth);
    }).sort((a, b) => {
        const diaA = parseInt(a.cumpleanos.split(' ')[0]) || 0;
        const diaB = parseInt(b.cumpleanos.split(' ')[0]) || 0;
        return diaA - diaB;
    });

    const getGroupName = (id) => {
        if (id === 'g1') return '3-7 años';
        if (id === 'g2') return '8-11 años';
        if (id === 'g3') return 'Adolescentes';
        return id;
    };

    const getGroupColor = (id) => {
        if (id === 'g1') return 'bg-orange-100 text-orange-600';
        if (id === 'g2') return 'bg-blue-100 text-blue-600';
        if (id === 'g3') return 'bg-purple-100 text-purple-600';
        return 'bg-gray-100 text-gray-600';
    };

    const handleDelete = async () => {
        if (!studentToDelete) return;
        try {
            const res = await fetch(`/api/estudiantes/${studentToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                setStudentToDelete(null);
                window.location.reload();
            } else {
                const error = await res.json();
                alert(`Error al eliminar: ${error.error}`);
            }
        } catch (err) {
            console.error("Error eliminando estudiante:", err);
            alert("Error de conexión al eliminar");
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-bone pb-28">
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
                            <span className="material-symbols-outlined notranslate">school</span>
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold tracking-tight text-charcoal">Alumnos</h1>
                            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">Hojas de Vida</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportExcel}
                            className="size-10 bg-white border border-gray-100 text-green-600 rounded-full flex items-center justify-center shadow-soft hover:bg-green-50 transition-all active:scale-90"
                            title="Descargar Excel"
                        >
                            <span className="material-symbols-outlined !text-xl notranslate">table_view</span>
                        </button>
                        <button
                            onClick={exportPDF}
                            className="size-10 bg-white border border-gray-100 text-red-600 rounded-full flex items-center justify-center shadow-soft hover:bg-red-50 transition-all active:scale-90"
                            title="Descargar PDF"
                        >
                            <span className="material-symbols-outlined !text-xl notranslate">picture_as_pdf</span>
                        </button>
                        {isAdmin && (
                            <button
                                onClick={onNewEstudiante}
                                className="size-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform"
                            >
                                <span className="material-symbols-outlined notranslate">add</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex bg-bone rounded-xl p-1 mt-4 border border-gray-100">
                    <button
                        onClick={() => setViewMode('lista')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'lista' ? 'bg-white text-primary shadow-sm' : 'text-charcoal/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm notranslate">list</span>
                        Lista Alumnos
                    </button>
                    <button
                        onClick={() => setViewMode('cumpleanos')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'cumpleanos' ? 'bg-white text-primary shadow-sm' : 'text-charcoal/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm notranslate">cake</span>
                        Cumpleaños
                    </button>
                </div>
            </header>

            <main className="pt-40 p-5 space-y-6">
                {viewMode === 'lista' ? (
                    <>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-silver text-xl notranslate">search</span>
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-gray-100 shadow-soft outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-charcoal"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'g1', label: '3-7 años' },
                                { id: 'g2', label: '8-11 años' },
                                { id: 'g3', label: 'Adolescentes' }
                            ].map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group.id)}
                                    className={`px-4 h-9 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedGroup === group.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                        : 'bg-white text-charcoal/60 border border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    {group.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filtered.length > 0 ? filtered.map(estudiante => (
                                <div key={estudiante.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex items-center gap-4 group transition-all">
                                    <div className="size-14 rounded-full bg-bone flex items-center justify-center text-charcoal/40 text-xl font-black">
                                        {(estudiante.nombre || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-charcoal">{estudiante.nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getGroupColor(estudiante.grupo)}`}>
                                                {getGroupName(estudiante.grupo)}
                                            </span>
                                            {estudiante.cumpleanos && (
                                                <span className="text-[10px] text-silver font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px] notranslate">cake</span>
                                                    {estudiante.cumpleanos}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 ml-auto">
                                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getAttendanceInfo(estudiante.id).color}`}>
                                                    {getAttendanceInfo(estudiante.id).label}
                                                </div>
                                                <span className="text-[9px] font-bold text-silver">{getAttendanceInfo(estudiante.id).ratio}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => setStudentToDelete(estudiante)}
                                                    className="size-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-outlined !text-xl notranslate">delete</span>
                                                </button>
                                                <button
                                                    onClick={() => onEditEstudiante(estudiante)}
                                                    className="size-10 rounded-full bg-bone text-charcoal/40 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined notranslate">edit</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center text-silver">
                                    <span className="material-symbols-outlined text-6xl mb-4 notranslate">person_search</span>
                                    <p className="font-bold">No se encontraron alumnos</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
                            {meses.map(mes => (
                                <button
                                    key={mes}
                                    onClick={() => setSelectedMonth(mes)}
                                    className={`px-6 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedMonth === mes
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-white text-charcoal/40 border border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    {mes}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                                Cumpleaños de <span className="text-primary">{selectedMonth}</span>
                            </h2>
                            {cumpleanosDelMes.length > 0 ? cumpleanosDelMes.map(estudiante => (
                                <div key={estudiante.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-soft flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined !text-3xl notranslate">cake</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-extra-bold text-charcoal leading-tight">{estudiante.nombre}</h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-1.5">
                                            <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                                                {estudiante.cumpleanos}
                                            </span>
                                            {estudiante.whatsapp_padres && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-green-500 text-[16px] notranslate">call</span>
                                                    <span className="text-[11px] font-bold text-silver">
                                                        {estudiante.whatsapp_padres}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getGroupColor(estudiante.grupo)}`}>
                                        {getGroupName(estudiante.grupo)}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center text-silver/40">
                                    <div className="size-20 rounded-full bg-bone flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl notranslate">celebration</span>
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-[10px]">Sin cumpleaños este mes</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {studentToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-6">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
                        <div className="text-center space-y-4">
                            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="material-symbols-outlined !text-4xl notranslate">warning</span>
                            </div>
                            <h3 className="text-xl font-black text-charcoal">¿Eliminar Alumno?</h3>
                            <p className="text-silver font-medium">
                                Estás a punto de eliminar a <span className="text-charcoal font-bold">{studentToDelete.nombre}</span>.
                                Esta acción también borrará todo su historial de asistencia y no se puede deshacer.
                            </p>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={handleDelete}
                                    className="w-full h-14 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/30 active:scale-[0.98] transition-all"
                                >
                                    SÍ, ELIMINAR AHORA
                                </button>
                                <button
                                    onClick={() => setStudentToDelete(null)}
                                    className="w-full h-14 bg-bone text-charcoal/40 rounded-2xl font-black active:scale-[0.98] transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('teacher-selection')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">menu_book</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Lecciones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reuniones')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">event</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Reuniones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary nav-indicator active">
                    <span className="material-symbols-outlined !text-[26px] fill-1 notranslate">school</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Alumnos</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reportes')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">bar_chart</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Reportes</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('maestros')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">group</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Maestros</span>
                </button>
            </nav>
        </div>
    );
};

export default Estudiantes;
