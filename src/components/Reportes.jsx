import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reportes = ({ clases, maestros, onNavigate }) => {
    const [generating, setGenerating] = useState(false);
    
    // Filtros
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');

    // Extraer periodos disponibles
    const availablePeriods = useMemo(() => {
        return Array.from(new Set(clases.map(clase => {
            const date = new Date(clase.fecha);
            const month = date.toLocaleString('es-ES', { month: 'long' });
            const year = date.getFullYear();
            return `${month} ${year}`;
        }))).sort((a, b) => {
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            if (yearA !== yearB) return yearB - yearA;
            return months.indexOf(monthB) - months.indexOf(monthA);
        });
    }, [clases]);

    const generateScheduleReport = () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            
            // 1. Encabezado Premium
            doc.setFillColor(196, 30, 36); // Rojo Primario
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("IBGV - Ministerio Infantil", 20, 20);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Iglesia Bíblica Gracia y Vida", 20, 28);
            
            const periodText = selectedPeriod === 'all' ? "Programación General" : `Mes: ${selectedPeriod.toUpperCase()}`;
            doc.setFontSize(14);
            doc.text(periodText, 20, 36);

            // 2. Información del Maestro
            let teacherName = "TODOS LOS MAESTROS";
            if (selectedTeacherId !== 'all') {
                const t = maestros.find(m => m.id === selectedTeacherId);
                teacherName = t ? t.nombre : "Maestro no encontrado";
            }
            
            doc.setTextColor(26, 28, 30);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`PROGRAMACIÓN PARA: ${teacherName}`, 20, 55);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 62);

            // 3. Filtrar Clases
            const filtered = clases.filter(clase => {
                const date = new Date(clase.fecha);
                const period = `${date.toLocaleString('es-ES', { month: 'long' })} ${date.getFullYear()}`;
                
                const matchesPeriod = selectedPeriod === 'all' || period === selectedPeriod;
                const matchesTeacher = selectedTeacherId === 'all' || 
                    clase.maestros?.ninos_pequenos === teacherName ||
                    clase.maestros?.ninos_grandes === teacherName ||
                    clase.maestros?.adolescentes === teacherName;
                
                return matchesPeriod && matchesTeacher;
            });

            // 4. Tabla de Clases con Lógica Inteligente
            const tableData = filtered.map(clase => {
                const asignaciones = [];
                
                const p = { name: clase.maestros?.ninos_pequenos, label: '3-7 años' };
                const g = { name: clase.maestros?.ninos_grandes, label: '8-11 años' };
                const a = { name: clase.maestros?.adolescentes, label: 'Adolescentes' };

                [p, g, a].forEach(item => {
                    if (!item.name || item.name === '-') return;
                    
                    // Si hay filtro por maestro, solo incluir si coincide con el nombre
                    if (selectedTeacherId !== 'all') {
                        if (item.name === teacherName) {
                            asignaciones.push(`${item.name} (${item.label})`);
                        }
                    } else {
                        // Si es reporte general, incluir todos
                        asignaciones.push(`${item.name} (${item.label})`);
                    }
                });

                return [
                    clase.fecha,
                    clase.leccion.titulo,
                    clase.leccion.pasaje_biblico,
                    asignaciones.join('\n') || 'Sin asignar'
                ];
            });

            autoTable(doc, {
                startY: 70,
                head: [['Fecha', 'Lección', 'Pasaje Bíblico', 'Asignación']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [196, 30, 36], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 55 },
                    2: { cellWidth: 55 },
                    3: { cellWidth: 40 }
                }
            });

            doc.save(`Programacion_${teacherName.replace(/\s/g, '_')}_${selectedPeriod.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error(error);
            alert("Error al generar el reporte PDF");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pt-20 pb-28">
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-charcoal transition-colors">
                        <span className="material-symbols-outlined notranslate">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-base font-extrabold tracking-tight text-charcoal leading-tight">Reportes</h1>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-[0.15em]">Descargas y Estadísticas</p>
                    </div>
                </div>
            </header>

            <main className="p-5 space-y-6">
                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined !text-3xl notranslate">calendar_today</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-charcoal">Programación Mensual</h2>
                            <p className="text-xs font-semibold text-silver">Genera el PDF para los maestros</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* Filtro Mes/Año */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 ml-1">Seleccionar Periodo</label>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full bg-bone border border-gray-100 p-4 rounded-xl text-sm font-bold text-charcoal focus:ring-2 focus:ring-primary/20 outline-none capitalize"
                            >
                                <option value="all">📅 Todos los meses registrados</option>
                                {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Filtro Maestro */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 ml-1">Seleccionar Maestro</label>
                            <select 
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="w-full bg-bone border border-gray-100 p-4 rounded-xl text-sm font-bold text-charcoal focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                <option value="all">👥 Todos los maestros (General)</option>
                                {maestros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={generateScheduleReport}
                            disabled={generating}
                            className="w-full bg-primary hover:bg-[#a6191e] text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mt-4"
                        >
                            <span className="material-symbols-outlined notranslate">download</span>
                            <span>DESCARGAR PDF PROGRAMACIÓN</span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-4">Otros Reportes</h3>
                        <button
                            onClick={() => onNavigate('reporte-formato')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-bone hover:bg-gray-100 transition-all active:scale-[0.98] group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-silver group-hover:text-primary transition-colors notranslate">folder_shared</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-charcoal">Reporte Formato (Word)</p>
                                    <p className="text-[10px] text-silver uppercase font-black">Archivos subidos por maestros</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-silver notranslate">chevron_right</span>
                        </button>
                    </div>
                </section>
            </main>

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
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('estudiantes')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">school</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Alumnos</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary nav-indicator active">
                    <span className="material-symbols-outlined !text-[26px] fill-1 notranslate">bar_chart</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Reportes</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('maestros')}>
                    <span className="material-symbols-outlined !text-[26px] notranslate">group</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Maestros</span>
                </button>
            </nav>
        </div>
    );
};

export default Reportes;
