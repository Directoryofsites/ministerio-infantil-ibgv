import React, { useState } from 'react';

const ReunionesView = ({ reuniones = [], onNavigate, isAdmin, selectedTeacher, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('virtuales'); // 'virtuales' o 'maestros'
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        titulo: '',
        tipo: 'Virtual', // 'Virtual' o 'Maestros'
        fecha: '',
        hora: '',
        enlace: '',
        descripcion: ''
    });

    const resetForm = () => {
        setFormData({
            id: Date.now().toString(),
            titulo: '',
            tipo: activeTab === 'virtuales' ? 'Virtual' : 'Maestros',
            fecha: '',
            hora: '',
            enlace: '',
            descripcion: ''
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEdit = (reunion) => {
        setFormData({
            ...reunion,
            hora: reunion.hora || '',
            enlace: reunion.enlace || '',
            descripcion: reunion.descripcion || ''
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = isEditing ? `/api/reuniones/${formData.id}` : '/api/reuniones';
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowForm(false);
                if (onRefresh) onRefresh();
            } else {
                alert("Error al guardar la reunión");
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta reunión?")) {
            try {
                const res = await fetch(`/api/reuniones/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    if (onRefresh) onRefresh();
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Filter reuniones based on the current active tab
    const reunionesFiltradas = reuniones.filter(r =>
        activeTab === 'virtuales' ? r.tipo === 'Virtual' : r.tipo === 'Maestros'
    );

    // Sorting by date descending (nearest first)
    const sortedReuniones = [...reunionesFiltradas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const canManage = isAdmin || selectedTeacher?.pin;

    if (showForm) {
        return (
            <div className="flex flex-col min-h-screen bg-bone w-full max-w-md mx-auto fade-in">
                <header className="flex items-center gap-3 p-4 bg-white shadow-soft sticky top-0 z-10 border-b border-gray-100">
                    <button onClick={() => setShowForm(false)} className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/60 hover:text-charcoal transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-charcoal">{isEditing ? 'Editar Reunión' : 'Nueva Reunión'}</h2>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{isEditing ? 'Actualizar Evento' : 'Crear Evento'}</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
                    <label className="flex flex-col w-full">
                        <p className="text-charcoal/80 text-sm font-bold pb-2">Título de la Reunión</p>
                        <input required name="titulo" value={formData.titulo} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 h-14 p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ej: Reunión Trimestral" />
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-charcoal/80 text-sm font-bold pb-2">Tipo</p>
                        <select required name="tipo" value={formData.tipo} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 h-14 px-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="Virtual">Para Alumnos (Virtual)</option>
                            <option value="Maestros">Solo Maestros</option>
                        </select>
                    </label>

                    <div className="flex gap-4">
                        <label className="flex flex-col w-1/2">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Fecha</p>
                            <input required type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 h-14 px-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                        <label className="flex flex-col w-1/2">
                            <p className="text-charcoal/80 text-sm font-bold pb-2">Hora (opcional)</p>
                            <input name="hora" type="time" value={formData.hora} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 h-14 px-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                        </label>
                    </div>

                    <label className="flex flex-col w-full">
                        <p className="text-charcoal/80 text-sm font-bold pb-2">Enlace / Link (Zoom, Meet)</p>
                        <input name="enlace" value={formData.enlace} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 h-14 p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..." />
                    </label>

                    <label className="flex flex-col w-full">
                        <p className="text-charcoal/80 text-sm font-bold pb-2">Descripción Corta</p>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full rounded-xl bg-white border border-gray-100 min-h-[100px] p-4 text-base font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Detalles o temática a tratar..." />
                    </label>

                    <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50 mt-6">
                        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Reunión' : 'Crear Reunión')}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-bone w-full max-w-md mx-auto fade-in pb-24">
            <header className="flex items-center justify-between p-6 bg-white shadow-soft sticky top-0 z-10 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-charcoal">Eventos</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Ministerio Infantil</p>
                </div>
                {canManage && (
                    <button
                        onClick={resetForm}
                        className="bg-primary hover:bg-[#a6191e] text-white size-12 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">event_available</span>
                    </button>
                )}
            </header>

            <div className="px-6 py-4 flex gap-4 border-b border-gray-100 bg-white">
                <button
                    onClick={() => setActiveTab('virtuales')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'virtuales' ? 'border-primary text-primary' : 'border-transparent text-charcoal/40 hover:text-charcoal/70'}`}
                >
                    Clases Virtuales
                </button>
                <button
                    onClick={() => setActiveTab('maestros')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'maestros' ? 'border-primary text-primary' : 'border-transparent text-charcoal/40 hover:text-charcoal/70'}`}
                >
                    Reunión Maestros
                </button>
            </div>

            <main className="p-6">
                <div className="space-y-4">
                    {sortedReuniones.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-soft">
                            <span className="material-symbols-outlined text-4xl text-silver mb-3 opacity-50">event_busy</span>
                            <p className="text-charcoal font-bold text-sm">No hay eventos programados.</p>
                            <p className="text-silver text-xs mt-1">Las reuniones futuras aparecerán aquí.</p>
                        </div>
                    ) : (
                        sortedReuniones.map(reunion => {
                            let dateObj;
                            if (reunion.fecha && reunion.fecha.includes('T')) {
                                dateObj = new Date(reunion.fecha);
                            } else {
                                dateObj = new Date(reunion.fecha + 'T00:00:00');
                            }
                            const formattedDate = isNaN(dateObj) ? 'Fecha no especificada' : dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

                            return (
                                <div key={reunion.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft relative overflow-hidden group hover:shadow-lg transition-all cursor-default">
                                    {/* Icon Background */}
                                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none">
                                        <span className="material-symbols-outlined !text-[120px] text-charcoal">
                                            {reunion.tipo === 'Virtual' ? 'devices' : 'groups'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{formattedDate}</p>
                                            <h3 className="text-lg font-bold text-charcoal leading-tight mt-1">{reunion.titulo || 'Sin Título'}</h3>
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-1 -mr-2 -mt-2">
                                                <button onClick={() => handleEdit(reunion)} className="text-silver hover:text-blue-500 transition-colors p-2" title="Editar reunión">
                                                    <span className="material-symbols-outlined !text-lg text-blue-500">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(reunion.id)} className="text-silver hover:text-red-500 transition-colors p-2" title="Eliminar reunión">
                                                    <span className="material-symbols-outlined !text-lg text-red-700">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {reunion.hora && (
                                        <div className="flex items-center gap-2 text-silver mb-2 relative z-10">
                                            <span className="material-symbols-outlined !text-[16px]">schedule</span>
                                            <p className="text-sm font-medium pr-1 border-r border-gray-200">Hora:</p>
                                            <p className="text-sm font-bold text-charcoal">{reunion.hora}</p>
                                        </div>
                                    )}

                                    {reunion.descripcion ? (
                                        <p className="text-sm text-silver mb-4 relative z-10">{reunion.descripcion}</p>
                                    ) : (
                                        <p className="text-xs text-silver/50 italic mb-4 relative z-10">Ningún otro detalle fue especificado.</p>
                                    )}

                                    {reunion.enlace && (
                                        <a
                                            href={reunion.enlace}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full mt-2 py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10"
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">videocam</span>
                                            Unirme a la Videollamada
                                        </a>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </main>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-primary transition-colors" onClick={() => onNavigate('teacher-selection')}>
                    <span className="material-symbols-outlined !text-[26px]">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined !text-[26px]">menu_book</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Lecciones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary nav-indicator active">
                    <span className="material-symbols-outlined !text-[26px] fill-1">event</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Reuniones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('estudiantes')}>
                    <span className="material-symbols-outlined !text-[26px]">school</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Alumnos</span>
                </button>
            </nav>
        </div>
    );
};

export default ReunionesView;
