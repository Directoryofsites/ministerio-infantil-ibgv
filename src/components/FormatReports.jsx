import React, { useState, useEffect } from 'react';

const FormatReports = ({ onNavigate }) => {
    const [formatos, setFormatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLessonId, setSelectedLessonId] = useState(null);

    useEffect(() => {
        fetchFormatos();
    }, []);

    const fetchFormatos = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bitacora/formatos`);
            const data = await res.json();
            setFormatos(data);
        } catch (error) {
            console.error('Error fetching formatos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, fileName) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el formato "${fileName}"?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bitacora/${id}/formato`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                alert('Formato eliminado correctamente');
                fetchFormatos(); // Recargar la lista
            } else {
                alert('Error al eliminar: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting format:', error);
            alert('Error al conectar con el servidor');
        }
    };

    // Agrupar formatos por lección (programacion_id)
    const groupedFormatos = formatos.reduce((acc, current) => {
        const id = current.programacion_id;
        if (!acc[id]) {
            acc[id] = {
                id,
                titulo: current.leccion_titulo,
                fecha: current.leccion_fecha,
                maestros: []
            };
        }
        acc[id].maestros.push(current);
        return acc;
    }, {});

    const lessonsList = Object.values(groupedFormatos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const formatDate = (dateStr, options = {}) => {
        if (!dateStr) return 'Fecha no disponible';
        // Extraer solo YYYY-MM-DD si viene con tiempo ISO
        const baseDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        try {
            return new Date(baseDate + 'T00:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                ...options
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-bone">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-silver uppercase tracking-widest">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    // Vista de detalle de una lección específica
    if (selectedLessonId) {
        const lesson = groupedFormatos[selectedLessonId];
        return (
            <div className="min-h-screen bg-bone pt-24 pb-32">
                <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4 px-6 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedLessonId(null)}
                        className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined notranslate">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-charcoal leading-none truncate">{lesson.titulo}</h1>
                        <p className="text-[10px] text-silver font-bold uppercase tracking-wider truncate">
                            {formatDate(lesson.fecha, { weekday: 'long' })}
                        </p>
                    </div>
                </header>
                {/* ...rest of the component logic remains the same... */}
                <main className="max-w-2xl mx-auto px-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">Formatos de Maestros</h3>
                            <span className="text-[10px] font-bold text-silver">{lesson.maestros.length} archivos</span>
                        </div>

                        {lesson.maestros.map((m) => (
                            <div key={m.id} className="bg-white p-5 rounded-3xl shadow-xl shadow-charcoal/5 border border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined !text-2xl notranslate">description</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-charcoal">{m.maestro_nombre}</h4>
                                        <p className="text-[10px] text-silver font-bold truncate max-w-[150px]">{m.formato_word_nombre}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(m.id, m.formato_word_nombre)}
                                        className="size-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
                                        title="Eliminar Formato"
                                    >
                                        <span className="material-symbols-outlined !text-xl notranslate">delete</span>
                                    </button>
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/api/bitacora/${m.id}/formato/descargar`}
                                        download={m.formato_word_nombre}
                                        className="size-10 flex items-center justify-center rounded-xl bg-primary text-white hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                                        title="Descargar Formato"
                                    >
                                        <span className="material-symbols-outlined !text-xl notranslate">download</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // Si la lección ya no tiene formatos después de una eliminación, volver a la lista
    if (selectedLessonId && !groupedFormatos[selectedLessonId]) {
        setSelectedLessonId(null);
    }

    return (
        <div className="min-h-screen bg-bone pt-24 pb-32">
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4 px-6 flex items-center gap-4">
                <button
                    onClick={() => onNavigate('reportes')}
                    className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined notranslate">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-sm font-black text-charcoal leading-none">Reporte Formato</h1>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Visualización de formatos Word</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">Lecciones con Reportes</h3>
                        <span className="text-[10px] font-bold text-silver">{lessonsList.length} lecciones</span>
                    </div>

                    {lessonsList.length > 0 ? (
                        <div className="grid gap-4">
                            {lessonsList.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setSelectedLessonId(lesson.id)}
                                    className="w-full text-left bg-white p-5 rounded-3xl shadow-xl shadow-charcoal/5 border border-transparent hover:border-primary/20 transition-all active:scale-[0.98] group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                                {formatDate(lesson.fecha)}
                                            </p>
                                            <h4 className="text-base font-black text-charcoal leading-tight group-hover:text-primary transition-colors">{lesson.titulo}</h4>
                                        </div>
                                        <div className="size-10 bg-bone rounded-2xl flex items-center justify-center text-silver group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined notranslate">chevron_right</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="px-2.5 py-1 bg-blue-50 rounded-full flex items-center gap-1.5">
                                            <span className="material-symbols-outlined !text-xs text-blue-600 notranslate">folder_zip</span>
                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                                                {lesson.maestros.length} reportes disponibles
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <span className="material-symbols-outlined !text-[64px] text-gray-200 mb-4 notranslate">draft_orders</span>
                            <p className="text-silver font-bold uppercase tracking-widest text-xs">No hay formatos subidos aún</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors"
                >
                    <span className="material-symbols-outlined !text-[26px] notranslate">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
                </button>
                <button
                    onClick={() => onNavigate('reportes')}
                    className="flex flex-col items-center gap-1 text-primary"
                >
                    <span className="material-symbols-outlined !text-[26px] fill-1 notranslate">bar_chart</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Reportes</span>
                </button>
            </nav>
        </div>
    );
};

export default FormatReports;
