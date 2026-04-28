import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';

const TeacherScheduleView = ({ teacher, clases, onBack, onSelectClase, onNavigate, onEditObservations }) => {
    const exportLessonPDF = (e, clase) => {
        e.stopPropagation();
        const doc = new jsPDF();
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = 55;

        const checkPageBreak = (neededHeight) => {
            if (currentY + neededHeight > pageHeight - margin) {
                doc.addPage();
                // Sub-header on new page
                doc.setFillColor(232, 70, 70);
                doc.rect(0, 0, pageWidth, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text(`Lección: ${clase.leccion.titulo} - Página ${doc.getNumberOfPages()}`, margin, 10);
                doc.setTextColor(40, 40, 40);
                currentY = 25;
                return true;
            }
            return false;
        };

        // Red Header Box
        doc.setFillColor(232, 70, 70);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FICHA DE LECCIÓN', margin, 25);

        doc.setFontSize(10);
        doc.text(`IBGV - Ministerio Infantil`, margin, 32);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.text(clase.leccion.titulo, margin, currentY);
        currentY += 10;

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Fecha: ${new Date(clase.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, currentY);
        currentY += 5;
        doc.text(`Maestro: ${teacher.nombre}`, margin, currentY);
        currentY += 5;
        doc.text(`Grupo: ${getGroupLabel(clase)}`, margin, currentY);
        currentY += 15;

        // Sections
        const renderSection = (title, content, fontSize = 10) => {
            checkPageBreak(15);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(232, 70, 70);
            doc.text(title, margin, currentY);
            doc.setDrawColor(232, 70, 70);
            doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
            currentY += 10;

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'normal');

            const lines = doc.splitTextToSize(content || 'No definido', contentWidth);
            for (let i = 0; i < lines.length; i++) {
                checkPageBreak(6);
                doc.text(lines[i], margin, currentY);
                currentY += 6;
            }
            currentY += 10;
        };

        renderSection('PASAJE BÍBLICO', clase.leccion.pasaje_biblico, 11);
        renderSection('ÉNFASIS PRINCIPAL', clase.leccion.enfasis_principal, 10);
        renderSection('ESTRUCTURA Y TEOLOGÍA', clase.leccion.teologia_preparacion, 10);

        doc.save(`Leccion_${clase.id}_${clase.leccion.titulo.substring(0, 20)}.pdf`);
    };
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const currentMonthIndex = new Date().getMonth();
    const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

    const filteredClases = useMemo(() => {
        return clases.filter(clase => {
            const classDate = new Date(clase.fecha + 'T00:00:00');
            const isSameMonth = classDate.getMonth() === selectedMonth;

            // Verificar si el maestro está asignado a alguno de los grupos
            const asignaciones = clase.rawAsignaciones || {};
            const isAssigned = Object.values(asignaciones).includes(teacher.id);

            return isSameMonth && isAssigned;
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }, [clases, selectedMonth, teacher.id]);

    const getGroupLabel = (clase) => {
        const asig = clase.rawAsignaciones || {};
        if (asig.maestro_3_7 === teacher.id) return "Niños 3-7 años";
        if (asig.maestro_8_11 === teacher.id) return "Niños 8-11 años";
        if (asig.maestro_adolescentes === teacher.id) return "Adolescentes";
        return "Sin definir";
    };

    const getDummyImg = (id) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;

    return (
        <div className="relative min-h-screen w-full bg-bone pt-24 pb-32">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4 px-6 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined notranslate">arrow_back</span>
                </button>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                        <img src={teacher.foto_url || getDummyImg(teacher.id)} alt={teacher.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-black text-charcoal leading-none truncate">{teacher.nombre}</h1>
                        <p className="text-[10px] text-silver font-bold uppercase tracking-wider truncate">Mi Programación</p>
                    </div>
                </div>
                <div className="flex-1 flex justify-end gap-2 shrink-0">
                    {teacher.rol === 'Administrador' && (
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-charcoal text-white rounded-full shadow-lg shadow-charcoal/20 active:scale-95 transition-all"
                            title="Panel de Control General"
                        >
                            <span className="material-symbols-outlined !text-lg notranslate">admin_panel_settings</span>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Panel</span>
                        </button>
                    )}
                    <button
                        onClick={() => onNavigate('asistencia')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined !text-lg notranslate">how_to_reg</span>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Asistencia</span>
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 space-y-8">
                {/* Selector de Mes */}
                <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-charcoal/5 border border-white">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">Seleccionar Mes</h3>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {months.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => setSelectedMonth(index)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${selectedMonth === index
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-bone text-silver hover:text-charcoal'
                                    }`}
                            >
                                {month.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Clases */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">
                            Agenda de {months[selectedMonth]}
                        </h3>
                        <span className="text-[10px] font-bold text-silver">{filteredClases.length} clases</span>
                    </div>

                    {filteredClases.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredClases.map((clase) => (
                                <div
                                    key={clase.id}
                                    onClick={() => onSelectClase(clase)}
                                    className="group relative bg-white p-5 rounded-3xl shadow-xl shadow-charcoal/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98]"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="space-y-1 w-full">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                {new Date(clase.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', weekday: 'long' })}
                                            </p>
                                            <h4 className="text-lg font-black text-charcoal leading-tight pr-4">{clase.leccion.titulo}</h4>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {clase.tiene_pdf && (
                                                <a
                                                    href={`/api/programacion/${clase.id}/pdf`}
                                                    download={clase.pdf_nombre}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="size-10 bg-red-50 text-red-500 flex items-center justify-center rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                                    title={`Descargar Material PDF: ${clase.pdf_nombre}`}
                                                >
                                                    <span className="material-symbols-outlined !text-[20px] notranslate">picture_as_pdf</span>
                                                </a>
                                            )}
                                            {clase.tiene_word && (
                                                <a
                                                    href={`/api/programacion/${clase.id}/word`}
                                                    download={clase.word_nombre}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="size-10 bg-blue-50 text-blue-500 flex items-center justify-center rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                                                    title={`Descargar Planeación (Word): ${clase.word_nombre}`}
                                                >
                                                    <span className="material-symbols-outlined !text-[20px] notranslate">description</span>
                                                </a>
                                            )}
                                            <button
                                                onClick={(e) => exportLessonPDF(e, clase)}
                                                className="size-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Descargar Ficha de Lección (Resumen)"
                                            >
                                                <span className="material-symbols-outlined !text-xl notranslate">picture_as_pdf</span>
                                            </button>
                                            <div className="size-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span className="material-symbols-outlined !text-xl notranslate">calendar_today</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-bone rounded-full">
                                            <span className="material-symbols-outlined notranslate !text-sm text-silver">groups</span>
                                            <span className="text-[10px] font-bold text-charcoal/70 uppercase tracking-tighter">{getGroupLabel(clase)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-bone rounded-full">
                                            <span className="material-symbols-outlined !text-sm text-silver notranslate">menu_book</span>
                                            <span className="text-[10px] font-bold text-charcoal/70 truncate max-w-[120px]">{clase.leccion.pasaje_biblico}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-silver uppercase tracking-widest group-hover:text-primary transition-colors">Ver detalles completos</span>
                                        <span className="material-symbols-outlined text-primary scale-0 group-hover:scale-100 transition-transform notranslate">chevron_right</span>
                                    </div>

                                    {/* ACCIONES DE MAESTRO */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditObservations && onEditObservations(clase);
                                            }}
                                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors border border-primary/5 z-10"
                                        >
                                            <span className="material-symbols-outlined !text-sm notranslate">edit_note</span>
                                            Añadir Observaciones
                                        </button>

                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const reader = new FileReader();
                                                    reader.onload = async (event) => {
                                                        const base64 = event.target.result;
                                                        try {
                                                            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bitacora/formato`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    programacion_id: clase.id,
                                                                    maestro_id: teacher.id,
                                                                    formato_base64: base64,
                                                                    formato_nombre: file.name
                                                                })
                                                            });
                                                            const data = await response.json();
                                                            if (data.success) {
                                                                alert('Formato subido exitosamente');
                                                                window.location.reload(); // Recargar para reflejar cambios si es necesario, aunque aquí es solo subida
                                                            } else {
                                                                alert('Error: ' + data.error);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error uploading file:', error);
                                                            alert('Error al conectar con el servidor');
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                                className="hidden"
                                                id={`file-upload-${clase.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById(`file-upload-${clase.id}`).click();
                                                }}
                                                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors border border-blue-100 z-10"
                                            >
                                                <span className="material-symbols-outlined !text-sm notranslate">upload_file</span>
                                                Añadir Formato
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <span className="material-symbols-outlined !text-[64px] text-gray-200 mb-4 notranslate">event_busy</span>
                            <p className="text-silver font-bold uppercase tracking-widest text-xs">No tienes clases programadas</p>
                            <p className="text-[10px] text-silver/60">en este mes</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Nav (Solo para Administradores o para volver al inicio) */}
            <nav className="fixed bottom-0 left-4 right-4 z-50 mb-6 flex justify-center">
                <div className="glass-effect bg-white/90 rounded-[2.5rem] shadow-2xl shadow-charcoal/20 border border-white/50 p-2 flex gap-1 px-4">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="flex flex-col items-center gap-1 p-3 px-6 text-charcoal/40 hover:text-primary transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined !text-2xl notranslate">home</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">Inicio</span>
                    </button>
                    <div className="w-px h-8 bg-gray-100 self-center"></div>
                    <button
                        onClick={() => onNavigate('reuniones')}
                        className="flex flex-col items-center gap-1 p-3 px-6 text-charcoal/40 hover:text-primary transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined !text-2xl notranslate">event</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">Reuniones</span>
                    </button>
                    <div className="w-px h-8 bg-gray-100 self-center"></div>
                    <button
                        onClick={() => onNavigate('calendario')}
                        className="flex flex-col items-center gap-1 p-3 px-6 text-charcoal/40 hover:text-primary transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined !text-2xl notranslate">calendar_view_month</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">General</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default TeacherScheduleView;
