import React, { useState, useEffect } from 'react';

const ObservacionesModal = ({ clase, teacher, onClose }) => {
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (clase?.id && teacher?.id) {
            setIsLoading(true);
            fetch(`/api/bitacora/${clase.id}/${teacher.id}`)
                .then(res => res.json())
                .then(data => setText(data.observacion || ''))
                .catch(err => console.error("Error loading bitacora:", err))
                .finally(() => setIsLoading(false));
        }
    }, [clase, teacher]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/bitacora', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    programacion_id: clase.id,
                    maestro_id: teacher.id,
                    observacion: text
                })
            });
            if (response.ok) {
                onClose();
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Error saving bitacora:", error);
            alert("No se pudieron guardar las observaciones");
        } finally {
            setIsSaving(false);
        }
    };

    const getGroupName = (id) => {
        if (id.includes('3_7')) return '3-7 años';
        if (id.includes('8_11')) return '8-11 años';
        if (id.includes('adolescentes')) return 'Adolescentes';
        return '';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] slide-in-bottom">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-charcoal leading-tight">Observaciones</h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                            {clase.leccion_titulo}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/40 hover:text-charcoal transition-colors">
                        <span className="material-symbols-outlined notranslate">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-sm notranslate">history_edu</span>
                            <span className="text-xs font-black text-primary uppercase tracking-wider">Bitácora del Maestro</span>
                        </div>
                        <p className="text-sm text-charcoal/70 leading-relaxed font-medium">
                            Por favor, escribe cualquier observación relevante sobre el desarrollo de la clase, el comportamiento de los niños o peticiones especiales.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="h-48 flex items-center justify-center bg-bone rounded-2xl border border-gray-100">
                            <span className="material-symbols-outlined spin text-primary notranslate">sync</span>
                        </div>
                    ) : (
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-48 p-5 rounded-2xl bg-bone border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 text-charcoal font-medium placeholder:text-silver/60 resize-none transition-shadow"
                            placeholder="Ej. Los niños estuvieron muy participativos hoy. Tuvimos dos visitantes nuevos..."
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-14 rounded-xl bg-bone text-charcoal font-bold hover:bg-gray-100 transition-colors active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] h-14 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-[#a6191e] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="material-symbols-outlined !text-xl notranslate">save</span>
                                <span>Guardar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObservacionesModal;
