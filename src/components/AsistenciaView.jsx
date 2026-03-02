import React, { useState, useEffect, useMemo } from 'react';

const AsistenciaView = ({ teacher, clases, estudiantes, onBack, onNavigate }) => {
    const [selectedClase, setSelectedClase] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [asistenciaData, setAsistenciaData] = useState({}); // { estudiante_id: presente }
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Obtener grupos asignados al maestro
    const assignedGroups = useMemo(() => {
        if (!teacher.especialidad) return [];
        return teacher.especialidad.split(',').filter(Boolean);
    }, [teacher.especialidad]);

    const availableClases = useMemo(() => {
        return clases.filter(clase => {
            const asignaciones = clase.rawAsignaciones || {};
            const isAssigned = Object.values(asignaciones).includes(teacher.id);
            return isAssigned;
        }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Más reciente primero
    }, [clases, teacher.id]);

    // Efecto para seleccionar la clase más reciente por defecto
    useEffect(() => {
        if (availableClases.length > 0 && !selectedClase) {
            setSelectedClase(availableClases[0]);
        }
    }, [availableClases, selectedClase]);

    // Efecto para seleccionar el primer grupo asignado si solo hay uno
    useEffect(() => {
        if (assignedGroups.length === 1 && !selectedGroup) {
            setSelectedGroup(assignedGroups[0]);
        }
    }, [assignedGroups, selectedGroup]);

    // Cargar asistencia guardada cuando cambia la clase
    useEffect(() => {
        if (selectedClase) {
            setLoading(true);
            fetch(`/api/asistencia/${selectedClase.id}`)
                .then(res => res.json())
                .then(data => {
                    const mapped = {};
                    data.forEach(a => mapped[a.estudiante_id] = a.presente);
                    setAsistenciaData(mapped);
                })
                .catch(err => console.error("Error cargando asistencia:", err))
                .finally(() => setLoading(false));
        }
    }, [selectedClase]);

    const filteredEstudiantes = useMemo(() => {
        if (!selectedGroup) return [];
        return estudiantes.filter(e => e.grupo === selectedGroup && e.activo);
    }, [estudiantes, selectedGroup]);

    const toggleAsistencia = (estudianteId) => {
        setAsistenciaData(prev => ({
            ...prev,
            [estudianteId]: !prev[estudianteId]
        }));
    };

    const handleSave = async () => {
        if (!selectedClase) return;
        setSaving(true);
        try {
            const asistencias = filteredEstudiantes.map(e => ({
                estudiante_id: e.id,
                presente: !!asistenciaData[e.id],
                fecha: selectedClase.fecha
            }));

            const res = await fetch('/api/asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    programacion_id: selectedClase.id,
                    asistencias
                })
            });

            if (res.ok) {
                alert("Asistencia guardada con éxito");
            } else {
                alert("Error al guardar asistencia");
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
        } finally {
            setSaving(false);
        }
    };

    const getGroupName = (id) => {
        if (id === 'g1') return '3-7 años';
        if (id === 'g2') return '8-11 años';
        if (id === 'g3') return 'Adolescentes';
        return id;
    };

    return (
        <div className="relative min-h-screen w-full bg-bone pt-24 pb-32">
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4 px-6 flex items-center gap-4">
                <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-sm font-black text-charcoal leading-none">Control de Asistencia</h1>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{teacher.nombre}</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 space-y-6">
                {/* Selector de Clase y Grupo */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-charcoal/5 border border-white space-y-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Selecciona la Clase</p>
                        <select
                            value={selectedClase?.id || ''}
                            onChange={(e) => setSelectedClase(availableClases.find(c => c.id === e.target.value))}
                            className="w-full bg-bone border border-gray-100 h-14 px-4 rounded-2xl font-bold text-charcoal outline-none focus:ring-2 focus:ring-primary/10"
                        >
                            {availableClases.map(c => (
                                <option key={c.id} value={c.id}>{c.fecha} - {c.leccion.titulo}</option>
                            ))}
                            {availableClases.length === 0 && <option value="">No hay clases programadas</option>}
                        </select>
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Tu Grupo Asignado</p>
                        <div className="flex gap-2">
                            {assignedGroups.map(gid => (
                                <button
                                    key={gid}
                                    onClick={() => setSelectedGroup(gid)}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black transition-all ${selectedGroup === gid
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-bone text-silver hover:text-charcoal'
                                        }`}
                                >
                                    {getGroupName(gid).toUpperCase()}
                                </button>
                            ))}
                            {assignedGroups.length === 0 && (
                                <p className="text-xs text-silver p-4 bg-bone rounded-2xl w-full text-center italic">No tienes grupos asignados en tu ficha</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Alumnos */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1 pt-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">Listado de Estudiantes</h3>
                        <span className="text-[10px] font-bold text-silver">{filteredEstudiantes.length} alumnos</span>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <span className="material-symbols-outlined text-4xl text-gray-200 spin">sync</span>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredEstudiantes.map(est => (
                                <div
                                    key={est.id}
                                    onClick={() => toggleAsistencia(est.id)}
                                    className={`flex items-center justify-between p-4 px-6 rounded-3xl border-2 transition-all cursor-pointer ${asistenciaData[est.id]
                                        ? 'bg-primary/5 border-primary/20'
                                        : 'bg-white border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`size-12 rounded-2xl flex items-center justify-center font-black transition-colors ${asistenciaData[est.id] ? 'bg-primary text-white' : 'bg-bone text-charcoal/30'
                                            }`}>
                                            {est.nombre.charAt(0)}
                                        </div>
                                        <span className={`font-bold transition-colors ${asistenciaData[est.id] ? 'text-charcoal' : 'text-silver'}`}>
                                            {est.nombre}
                                        </span>
                                    </div>
                                    <div className={`size-8 rounded-full flex items-center justify-center transition-all ${asistenciaData[est.id] ? 'bg-primary text-white scale-110' : 'bg-bone text-transparent'
                                        }`}>
                                        <span className="material-symbols-outlined !text-xl">check_bold</span>
                                    </div>
                                </div>
                            ))}

                            {filteredEstudiantes.length === 0 && selectedGroup && (
                                <div className="py-20 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <span className="material-symbols-outlined !text-5xl text-gray-200 mb-2">person_off</span>
                                    <p className="text-silver font-bold uppercase tracking-widest text-[10px]">No hay alumnos registrados</p>
                                    <p className="text-[9px] text-silver/60">en este grupo</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Botón Guardar */}
                {filteredEstudiantes.length > 0 && (
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="w-full h-16 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="material-symbols-outlined spin">sync</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    GUARDAR ASISTENCIA
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AsistenciaView;
