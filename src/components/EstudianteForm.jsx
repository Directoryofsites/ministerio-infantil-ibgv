import React, { useState, useEffect, useMemo } from 'react';

const EstudianteForm = ({ onClose, onSaveSuccess, estudianteToEdit }) => {
    const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'asistencia'
    const [asistenciaHistoria, setAsistenciaHistoria] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: estudianteToEdit ? estudianteToEdit.nombre : '',
        grupo: estudianteToEdit ? (estudianteToEdit.grupo || '') : '',
        cumpleanos: estudianteToEdit ? (estudianteToEdit.cumpleanos || '') : '',
        whatsapp_padres: estudianteToEdit ? (estudianteToEdit.whatsapp_padres || '') : '',
        activo: estudianteToEdit ? estudianteToEdit.activo : true,
        observaciones: estudianteToEdit ? (estudianteToEdit.observaciones || '') : ''
    });

    useEffect(() => {
        if (estudianteToEdit?.id && activeTab === 'asistencia') {
            fetch(`/api/asistencia/estudiante/${estudianteToEdit.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setAsistenciaHistoria(data);
                })
                .catch(err => console.error("Error cargando historial de asistencia", err));
        }
    }, [estudianteToEdit?.id, activeTab]);

    const asistenciaFiltrada = useMemo(() => {
        return asistenciaHistoria.filter(record => {
            if (!record.fecha) return false;
            const recordMonth = record.fecha.substring(0, 7); // 'YYYY-MM'
            return recordMonth === selectedMonth;
        });
    }, [asistenciaHistoria, selectedMonth]);

    const availableMonths = useMemo(() => {
        const months = new Set(asistenciaHistoria.map(r => r.fecha?.substring(0, 7)).filter(Boolean));
        // Ensure current month is always an option even if no records yet
        months.add(new Date().toISOString().slice(0, 7));
        return Array.from(months).sort().reverse();
    }, [asistenciaHistoria]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const endpoint = estudianteToEdit ? `/api/estudiantes/${estudianteToEdit.id}` : '/api/estudiantes';
            const method = estudianteToEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSaveSuccess();
            } else {
                alert("Error al guardar el estudiante");
            }
        } catch (error) {
            console.error("Error submitting student:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-white max-w-md mx-auto fade-in animate-in pb-28">
            <header className="flex items-center gap-3 p-4 sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
                <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-charcoal">
                    <span className="material-symbols-outlined notranslate">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-black text-charcoal">{estudianteToEdit ? 'Perfil del Alumno' : 'Nueva Hoja de Vida'}</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Estudiante IBGV</p>
                </div>
            </header>

            {estudianteToEdit && (
                <div className="flex px-6 pt-4 gap-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('datos')}
                        className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'datos' ? 'border-primary text-primary' : 'border-transparent text-charcoal/40 hover:text-charcoal/70'}`}
                    >
                        Datos Personales
                    </button>
                    <button
                        onClick={() => setActiveTab('asistencia')}
                        className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'asistencia' ? 'border-primary text-primary' : 'border-transparent text-charcoal/40 hover:text-charcoal/70'}`}
                    >
                        Asistencia
                    </button>
                </div>
            )}

            {activeTab === 'datos' ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <div className="flex flex-col items-center justify-center py-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
                        <span className="material-symbols-outlined text-primary text-5xl mb-2 notranslate">person</span>
                        <p className="text-primary font-bold text-sm tracking-tight text-center px-4">Información Personal del Estudiante</p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Nombre Completo</p>
                            <input required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full rounded-xl bg-bone border border-gray-100 h-14 p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nombre del niño/niña" />
                        </label>

                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Grupo de Edad</p>
                            <select required name="grupo" value={formData.grupo} onChange={handleChange} className="w-full rounded-xl bg-bone border border-gray-100 h-14 px-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                                <option value="">Seleccionar grupo</option>
                                <option value="g1">Niños 3-7 años</option>
                                <option value="g2">Niños 8-11 años</option>
                                <option value="g3">Adolescentes</option>
                            </select>
                        </label>

                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Día y Mes de Cumpleaños</p>
                            <input name="cumpleanos" value={formData.cumpleanos} onChange={handleChange} type="text" className="w-full rounded-xl bg-bone border border-gray-100 h-14 p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ej: 17 de Junio" />
                        </label>

                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">WhatsApp Padres</p>
                            <input name="whatsapp_padres" value={formData.whatsapp_padres} onChange={handleChange} className="w-full rounded-xl bg-bone border border-gray-100 h-14 p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="+57 ..." />
                        </label>

                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Observaciones / Hoja de Vida</p>
                            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className="w-full rounded-xl bg-bone border border-gray-100 min-h-[140px] p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Alergias, necesidades especiales, progreso espiritual..." />
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-bone rounded-xl cursor-pointer">
                            <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="size-5 accent-primary" />
                            <span className="text-sm font-bold text-charcoal">Estudiante Activo</span>
                        </label>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Guardar Datos'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-charcoal font-black text-lg">Historial</h3>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-bone text-charcoal font-bold text-sm py-2 px-4 rounded-full border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {availableMonths.map(m => {
                                const [year, month] = m.split('-');
                                const date = new Date(year, month - 1);
                                const label = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                                return <option key={m} value={m}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>
                            })}
                        </select>
                    </div>

                    {asistenciaFiltrada.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-silver mb-4 opacity-50 notranslate">event_busy</span>
                            <p className="text-charcoal font-bold">No hay clases registradas</p>
                            <p className="text-sm text-silver mt-1">Tu estudiante no tiene registro en el mes seleccionado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {asistenciaFiltrada.map((record, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-soft">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${record.presente ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            <span className="material-symbols-outlined text-xl notranslate">
                                                {record.presente ? 'check_circle' : 'cancel'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-charcoal text-sm">{record.fecha ? new Date(record.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' }) : 'Sin fecha'}</p>
                                            <p className="text-xs font-semibold text-silver">{record.leccion_titulo || 'Clase General'}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${record.presente ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                                        {record.presente ? 'Presente' : 'Ausente'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EstudianteForm;
