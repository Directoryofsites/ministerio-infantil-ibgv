import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const Reportes = ({ clases, maestros, onNavigate }) => {
    const [generating, setGenerating] = useState(false);

    const generateMonthlyReport = () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const today = new Date().toLocaleDateString();

            // Configuración de Estilos
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(196, 30, 36); // Primary Red
            doc.text("IBGV - Escuela Infantil", 20, 20);

            doc.setFontSize(14);
            doc.setTextColor(26, 28, 30); // Charcoal
            doc.text("Reporte Mensual de Clases y Observaciones", 20, 30);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Generado el: ${today}`, 20, 35);

            doc.setDrawColor(196, 30, 36);
            doc.line(20, 40, 190, 40);

            let y = 50;

            clases.forEach((clase, index) => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(26, 28, 30);
                doc.text(`${clase.fecha} - ${clase.leccion.titulo}`, 20, y);
                y += 7;

                doc.setFont("helvetica", "italic");
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Pasaje: ${clase.leccion.pasaje_biblico}`, 25, y);
                y += 10;

                doc.setFont("helvetica", "bold");
                doc.setTextColor(196, 30, 36);
                doc.text("Observaciones del Maestro:", 25, y);
                y += 5;

                doc.setFont("helvetica", "normal");
                doc.setTextColor(50, 50, 50);
                const obsLines = doc.splitTextToSize(clase.observaciones || "Sin observaciones registradas.", 160);
                doc.text(obsLines, 25, y);
                y += (obsLines.length * 5) + 10;

                // Sección Asistencia en el Reporte
                doc.setFont("helvetica", "bold");
                doc.setTextColor(196, 30, 36);
                doc.text("Resumen de Asistencia:", 25, y);
                y += 5;

                // Aquí idealmente filtraríamos la asistencia real de la DB, 
                // por ahora generamos un resumen de los grupos que asistieron.
                doc.setFont("helvetica", "italic");
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text("• Asistencia registrada y guardada en el sistema digital.", 25, y);
                y += 15;
            });

            doc.save(`Reporte_IBGV_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);
        } catch (error) {
            console.error("Error generando PDF:", error);
            alert("No se pudo generar el PDF");
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
                            <span className="material-symbols-outlined !text-3xl notranslate">picture_as_pdf</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-charcoal">Reportes Mensuales</h2>
                            <p className="text-xs font-semibold text-silver">Documentación oficial para la iglesia</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={generateMonthlyReport}
                            disabled={generating}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-bone hover:bg-gray-100 transition-all active:scale-[0.98] group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-silver group-hover:text-primary transition-colors notranslate">description</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-charcoal">Resumen de Clases y Bitácora</p>
                                    <p className="text-[10px] text-silver uppercase font-black">Formato PDF • Todo el mes</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-silver notranslate">download</span>
                        </button>

                        <button
                            onClick={() => onNavigate('reporte-formato')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all active:scale-[0.98] group border border-blue-100/50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-400 group-hover:text-blue-600 transition-colors notranslate">folder_shared</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-charcoal">Reporte Formato</p>
                                    <p className="text-[10px] text-blue-500 uppercase font-black">Archivos Word subidos por maestros</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-blue-400 notranslate">chevron_right</span>
                        </button>
                    </div>
                </section>

                <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="size-12 rounded-xl bg-charcoal/5 flex items-center justify-center text-charcoal/30">
                            <span className="material-symbols-outlined !text-3xl notranslate">analytics</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-charcoal/40">Estadísticas de Asistencia</h2>
                            <p className="text-xs font-semibold text-silver">Próximamente</p>
                        </div>
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
                <button className="flex flex-col items-center gap-1 text-primary nav-indicator active">
                    <span className="material-symbols-outlined !text-[26px] fill-1 notranslate">bar_chart</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Reportes</span>
                </button>
            </nav>
        </div>
    );
};

export default Reportes;
