import React, { useState, useEffect } from 'react';

const ClassForm = ({ onClose, onSaveSuccess, claseToEdit, showClassForm }) => {
    const [maestros, setMaestros] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fecha: claseToEdit ? (claseToEdit.rawFecha ? claseToEdit.rawFecha.split('T')[0] : '') : '',
        leccion: {
            titulo: claseToEdit ? claseToEdit.leccion.titulo : '',
            pasaje_biblico: claseToEdit ? claseToEdit.leccion.pasaje_biblico : '',
            enfasis_principal: claseToEdit ? claseToEdit.leccion.enfasis_principal : '',
            teologia_preparacion: claseToEdit ? claseToEdit.leccion.teologia_preparacion : ''
        },
        asignaciones: {
            maestro_3_7: claseToEdit && claseToEdit.rawAsignaciones ? claseToEdit.rawAsignaciones.maestro_3_7 || '' : '',
            maestro_8_11: claseToEdit && claseToEdit.rawAsignaciones ? claseToEdit.rawAsignaciones.maestro_8_11 || '' : '',
            maestro_adolescentes: claseToEdit && claseToEdit.rawAsignaciones ? claseToEdit.rawAsignaciones.maestro_adolescentes || '' : ''
        }
    });

    // Reset loop: Sincroniza el formulario cuando cambia la clase a editar
    useEffect(() => {
        if (claseToEdit) {
            console.log(">>> Datos cargados en Form (REACT DEBUG):", claseToEdit);
            setFormData({
                fecha: claseToEdit.rawFecha ? (claseToEdit.rawFecha.includes('T') ? claseToEdit.rawFecha.split('T')[0] : claseToEdit.rawFecha) : '',
                leccion: {
                    titulo: (claseToEdit.leccion && claseToEdit.leccion.titulo) || '',
                    pasaje_biblico: (claseToEdit.leccion && claseToEdit.leccion.pasaje_biblico) || '',
                    enfasis_principal: (claseToEdit.leccion && claseToEdit.leccion.enfasis_principal) || '',
                    teologia_preparacion: (claseToEdit.leccion && claseToEdit.leccion.teologia_preparacion) || ''
                },
                asignaciones: {
                    maestro_3_7: claseToEdit.rawAsignaciones ? (claseToEdit.rawAsignaciones.maestro_3_7 || '') : '',
                    maestro_8_11: claseToEdit.rawAsignaciones ? (claseToEdit.rawAsignaciones.maestro_8_11 || '') : '',
                    maestro_adolescentes: claseToEdit.rawAsignaciones ? (claseToEdit.rawAsignaciones.maestro_adolescentes || '') : ''
                }
            });
        }
    }, [claseToEdit, showClassForm]); // Added showClassForm dependency for freshness

    useEffect(() => {
        // Fetch teachers to populate the dropdowns
        const fetchMaestros = async () => {
            try {
                const res = await fetch('/api/ministerio');
                const data = await res.json();
                if (data.ministerio_infantil?.maestros) {
                    setMaestros(data.ministerio_infantil.maestros);
                }
            } catch (err) {
                console.error("Error fetching teachers:", err);
            }
        };
        fetchMaestros();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('leccion.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                leccion: { ...prev.leccion, [field]: value }
            }));
        } else if (name.startsWith('asignaciones.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                asignaciones: { ...prev.asignaciones, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const isEdit = !!(claseToEdit && claseToEdit.id);
            const newClassId = isEdit ? claseToEdit.id : `${Date.now()}`;
            const payload = { ...formData, id: newClassId };

            const endpoint = isEdit ? `/api/programacion/${claseToEdit.id}` : '/api/programacion';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onSaveSuccess) onSaveSuccess();
                else onClose();
            } else {
                alert("Error al guardar la clase");
            }
        } catch (error) {
            console.error("Error submitting class:", error);
            alert("Error de red al guardar la clase");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-gray-100 fade-in animate-in pb-28">
            {/* Header / TopAppBar */}
            <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="flex size-20 shrink-0 items-center justify-start py-2">
                    <img
                        src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                        alt="Logo IBGV"
                        className="w-full h-full object-contain logo-blend"
                    />
                </div>
                <div className="flex flex-col items-center flex-1">
                    <div className="h-6 w-auto mb-1 flex items-center justify-center">
                        <span className="text-primary font-bold tracking-tighter text-sm">Escuela Infantil</span>
                    </div>
                    <h2 className="text-charcoal text-lg font-bold leading-tight tracking-tight">Programar Clase</h2>
                </div>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex items-center justify-center rounded-xl h-12 bg-transparent text-primary p-0">
                        <span className="material-symbols-outlined">check_circle</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col p-4 space-y-6">
                {/* Hero Image Placeholder */}
                <div>
                    <div className="w-full bg-primary/5 flex flex-col items-center justify-center overflow-hidden rounded-xl min-h-[160px] border-2 border-dashed border-primary/20">
                        <span className="material-symbols-outlined text-primary text-4xl mb-2">auto_stories</span>
                        <p className="text-primary font-medium text-sm">Planificación Dominical</p>
                    </div>
                </div>

                {/* General Info Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                        <h3 className="text-charcoal text-md font-bold leading-tight">Información General</h3>
                    </div>
                    <div className="space-y-4">
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Fecha de la Clase</p>
                            <div className="relative">
                                <input required name="fecha" value={formData.fecha} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium bg-bone shadow-sm" type="date" />
                            </div>
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Título de la Lección</p>
                            <input required name="leccion.titulo" value={formData.leccion.titulo} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 placeholder:text-silver p-4 text-base font-medium bg-bone shadow-sm" placeholder="Ej. El Arca de Noé" />
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Pasaje Bíblico</p>
                            <input name="leccion.pasaje_biblico" value={formData.leccion.pasaje_biblico} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 placeholder:text-silver p-4 text-base font-medium bg-bone shadow-sm" placeholder="Ej. Génesis 6:1-9:17" />
                        </label>
                    </div>
                </section>

                {/* Assignment Section */}
                <section className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-xl">group</span>
                        <h3 className="text-charcoal text-md font-bold leading-tight">Asignación de Maestros</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <label className="flex flex-col w-full relative">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Maestro 3-7 años</p>
                            <select name="asignaciones.maestro_3_7" value={formData.asignaciones.maestro_3_7} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium appearance-none bg-bone shadow-sm">
                                <option value="">Seleccionar maestro</option>
                                {maestros.filter(m => m.activo && m.especialidad && m.especialidad.split(',').includes('g1')).map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col w-full relative">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Maestro 8-11 años</p>
                            <select name="asignaciones.maestro_8_11" value={formData.asignaciones.maestro_8_11} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium appearance-none bg-bone shadow-sm">
                                <option value="">Seleccionar maestro</option>
                                {maestros.filter(m => m.activo && m.especialidad && m.especialidad.split(',').includes('g2')).map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col w-full relative">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Maestro Adolescentes</p>
                            <select name="asignaciones.maestro_adolescentes" value={formData.asignaciones.maestro_adolescentes} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium appearance-none bg-bone shadow-sm">
                                <option value="">Seleccionar maestro</option>
                                {maestros.filter(m => m.activo && m.especialidad && m.especialidad.split(',').includes('g3')).map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                {/* Detailed Content Section */}
                <section className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                        <h3 className="text-charcoal text-md font-bold leading-tight">Contenido de la Clase</h3>
                    </div>
                    <div className="space-y-4">
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Énfasis Principal</p>
                            <textarea name="leccion.enfasis_principal" value={formData.leccion.enfasis_principal} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 min-h-[120px] p-4 text-base font-medium resize-none bg-bone shadow-sm" placeholder="Describe el punto central de la lección..."></textarea>
                        </label>
                        <label className="flex flex-col w-full">
                            <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Estructura del Pasaje y Teología</p>
                            <textarea name="leccion.teologia_preparacion" value={formData.leccion.teologia_preparacion} onChange={handleChange} className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 min-h-[160px] p-4 text-base font-medium resize-none bg-bone shadow-sm" placeholder="Desglose de los versículos y verdades teológicas..."></textarea>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-6 pb-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20 text-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Clase'}
                    </button>
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full h-14 bg-bone text-charcoal font-bold rounded-xl active:scale-95 transition-transform border border-gray-200 hover:bg-gray-100 mt-2"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClassForm;
