import React, { useState, useEffect } from 'react';

const MaestroForm = ({ onClose, onSaveSuccess, maestroToEdit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: maestroToEdit ? maestroToEdit.nombre : '',
        especialidad: maestroToEdit ? (maestroToEdit.especialidad || '').split(',').filter(Boolean) : [],
        activo: maestroToEdit ? maestroToEdit.activo : true,
        foto_url: maestroToEdit ? (maestroToEdit.foto_url || '') : '',
        rol: maestroToEdit ? (maestroToEdit.rol || 'Invitado') : 'Invitado',
        pin: maestroToEdit ? (maestroToEdit.pin || '') : ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'pin') {
            // Only allow up to 4 digits
            const formattedPin = value.replace(/\D/g, '').slice(0, 4);
            setFormData(prev => ({ ...prev, pin: formattedPin }));
            return;
        }
        if (name === 'especialidad') {
            setFormData(prev => {
                const current = prev.especialidad;
                if (checked) {
                    return { ...prev, especialidad: [...current, value] };
                } else {
                    return { ...prev, especialidad: current.filter(id => id !== value) };
                }
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const endpoint = maestroToEdit ? `/api/maestros/${maestroToEdit.id}` : '/api/maestros';
            const method = maestroToEdit ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                especialidad: formData.especialidad.join(','),
                id: maestroToEdit ? maestroToEdit.id : `m-${Date.now()}`
            };

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onSaveSuccess) onSaveSuccess();
                else onClose();
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error || 'No se pudo guardar el maestro'}`);
            }
        } catch (error) {
            console.error("Error submitting teacher:", error);
            alert("Error de red al guardar el maestro");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white border-x border-gray-100 fade-in animate-in pb-28">
            <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="flex size-20 shrink-0 items-center justify-start py-2">
                    <img
                        src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                        alt="Logo IBGV"
                        className="w-full h-full object-contain logo-blend"
                    />
                </div>
                <div className="flex flex-col items-center flex-1">
                    <h2 className="text-charcoal text-lg font-bold leading-tight tracking-tight">
                        {maestroToEdit ? 'Editar Maestro' : 'Nuevo Maestro'}
                    </h2>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-[0.15em]">Escuela Infantil</p>
                </div>
                <div className="w-10"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-6">
                <div className="flex flex-col items-center pb-4">
                    <div className="size-24 rounded-full bg-gray-100 overflow-hidden mb-4 border-4 border-bone shadow-sm relative group">
                        <img
                            src={formData.foto_url || `https://i.pravatar.cc/150?u=${maestroToEdit ? maestroToEdit.id : 'new'}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://i.pravatar.cc/150?u=error-${Date.now()}`;
                            }}
                        />
                        {!formData.foto_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-sm whitespace-nowrap px-2 notranslate">add_a_photo</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-silver font-medium text-center max-w-[200px]">
                        {formData.foto_url ? 'Foto personalizada activa' : 'Usando foto automática por defecto'}
                    </p>
                </div>

                <label className="flex flex-col w-full">
                    <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">URL de la Foto (Opcional)</p>
                    <input
                        name="foto_url"
                        value={formData.foto_url}
                        onChange={handleChange}
                        className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium bg-bone shadow-sm"
                        placeholder="https://ejemplo.com/foto.jpg"
                    />
                </label>

                <label className="flex flex-col w-full">
                    <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Nombre Completo</p>
                    <input
                        required
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium bg-bone shadow-sm"
                        placeholder="Ej. Juan Pérez"
                    />
                </label>

                <label className="flex flex-col w-full">
                    <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">Rol de Acceso</p>
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="flex w-full rounded-xl text-charcoal focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-base font-medium bg-bone shadow-sm appearance-none"
                    >
                        <option value="Invitado">Invitado (Solo consultas y bitácora)</option>
                        <option value="Administrador">Administrador (Puede editar, sin crear maestros)</option>
                    </select>
                </label>

                {formData.rol === 'Administrador' && (
                    <label className="flex flex-col w-full animate-in fade-in slide-in-from-top-2">
                        <p className="text-charcoal/80 text-sm font-bold leading-normal pb-2 px-1">PIN de Acceso (4 dígitos)</p>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{4}"
                            maxLength="4"
                            name="pin"
                            value={formData.pin}
                            onChange={handleChange}
                            className="flex w-full rounded-xl text-charcoal text-center tracking-[1em] focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-gray-200 h-14 p-4 text-2xl font-black bg-bone shadow-sm"
                            placeholder="****"
                        />
                        <p className="text-[10px] text-silver font-medium text-center pt-2">
                            Este PIN será solicitado al momento de entrar.
                        </p>
                    </label>
                )}

                <div className="flex flex-col w-full space-y-3">
                    <p className="text-charcoal/80 text-sm font-bold leading-normal px-1">Grupos de Edades que puede enseñar</p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'g1', label: 'Niños 3-7 años' },
                            { id: 'g2', label: 'Niños 8-11 años' },
                            { id: 'g3', label: 'Adolescentes' }
                        ].map(grupo => (
                            <label key={grupo.id} className="flex items-center p-4 bg-bone rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="especialidad"
                                    value={grupo.id}
                                    checked={formData.especialidad.includes(grupo.id)}
                                    onChange={handleChange}
                                    className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="ml-3 text-sm font-bold text-charcoal">{grupo.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-bone rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-charcoal">¿Está Activo?</span>
                        <span className="text-xs text-silver">Los maestros inactivos no aparecerán en la programación.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex flex-col gap-3 pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20 text-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Maestro'}
                    </button>
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full h-14 bg-bone text-charcoal font-bold rounded-xl active:scale-95 transition-transform border border-gray-200 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaestroForm;
