import React, { useState, useEffect } from 'react';

const ClassDetail = ({ clase, onClose, onEdit, onDelete, onDuplicate, isAdmin, onRefresh }) => {
    const [asistencia, setAsistencia] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') return alert('Solo se permiten archivos PDF');
        if (file.size > 5 * 1024 * 1024) return alert('El archivo es muy pesado. Máximo 5MB permitido.');

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch(`/api/programacion/${clase.id}/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pdf_base64: reader.result, pdf_nombre: file.name })
                });
                if (res.ok) {
                    if (onRefresh) onRefresh();
                    onClose();
                } else alert('Error al subir archivo');
            } catch (err) {
                console.error(err);
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleDeletePdf = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar el PDF de esta lección?")) return;
        try {
            const res = await fetch(`/api/programacion/${clase.id}/pdf`, { method: 'DELETE' });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (clase?.id) {
            fetch(`/api/asistencia/${clase.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAsistencia(data.filter(a => a.presente).map(a => a.estudiante_id));
                    }
                })
                .catch(err => console.error("Error cargando asistencia de clase:", err));
        }
    }, [clase?.id]);

    if (!clase) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">

                {/* Acciones */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    {isAdmin && (
                        <>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(clase)}
                                    className="p-2 rounded-full bg-bone hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                    title="Editar Clase"
                                >
                                    <span className="material-symbols-outlined text-[20px] notranslate">edit</span>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(clase)}
                                    className="p-2 rounded-full bg-bone hover:bg-red-100 hover:text-red-600 transition-colors"
                                    title="Eliminar Clase"
                                >
                                    <span className="material-symbols-outlined text-[20px] notranslate">delete</span>
                                </button>
                            )}
                            {onDuplicate && (
                                <button
                                    onClick={() => onDuplicate(clase)}
                                    className="p-2 rounded-full bg-bone hover:bg-green-100 hover:text-green-600 transition-colors"
                                    title="Duplicar / Clonar"
                                >
                                    <span className="material-symbols-outlined text-[20px] notranslate">content_copy</span>
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 ml-2 rounded-full bg-bone hover:bg-charcoal/10 hover:text-charcoal transition-colors"
                        title="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    {/* Cabecera del Detalle */}
                    <header className="mb-10 border-b border-bone pb-8">
                        <div className="flex items-center space-x-2 text-primary font-bold uppercase tracking-widest text-sm mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>{clase.fecha}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-charcoal leading-tight mb-4">
                            {clase.leccion.titulo}
                        </h2>
                        <p className="text-xl text-silver font-medium italic">
                            Pasaje Bíblico: {clase.leccion.pasaje_biblico}
                        </p>
                    </header>

                    {/* Paneles de Contenido */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Panel A: Énfasis Principal */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Énfasis Principal</h3>
                                <div className="h-px flex-1 bg-primary/10"></div>
                            </div>
                            <div className="bg-bone p-6 rounded-2xl border-l-4 border-primary">
                                <p className="text-charcoal leading-relaxed text-lg font-medium">
                                    {clase.leccion.enfasis_principal}
                                </p>
                            </div>
                        </div>

                        {/* Panel B: Estructura y Teología */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-charcoal">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Estructura y Teología</h3>
                                <div className="h-px flex-1 bg-bone"></div>
                            </div>
                            <div className="text-silver leading-relaxed space-y-4">
                                <p className="text-charcoal/80 whitespace-pre-wrap">
                                    {clase.leccion.teologia_preparacion}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Panel C: Material Adjunto (PDF) */}
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center space-x-3 text-red-600">
                            <h3 className="text-lg font-bold uppercase tracking-tight">Material Adjunto</h3>
                            <div className="h-px flex-1 bg-red-100"></div>
                        </div>

                        {clase.tiene_pdf ? (
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined !text-4xl text-red-500 notranslate">picture_as_pdf</span>
                                    <div>
                                        <p className="font-bold text-red-900">{clase.pdf_nombre}</p>
                                        <p className="text-xs text-red-600/70 font-medium">Documento PDF Adjunto</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={`/api/programacion/${clase.id}/pdf`}
                                        download={clase.pdf_nombre}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/20 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined !text-lg notranslate">download</span>
                                        Descargar
                                    </a>
                                    {isAdmin && (
                                        <button onClick={handleDeletePdf} className="p-3 bg-white text-red-500 hover:bg-red-100 rounded-xl transition-colors border border-red-200">
                                            <span className="material-symbols-outlined !text-lg notranslate">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            isAdmin ? (
                                <div className="bg-bone p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined !text-4xl text-silver mb-2 notranslate">upload_file</span>
                                    <p className="text-charcoal font-bold mb-1">Subir Material para la Lección</p>
                                    <p className="text-silver text-xs mb-4">Solo archivos PDF (Máximo 5MB)</p>

                                    <label className={`bg-charcoal hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <span className="material-symbols-outlined !text-lg notranslate">publish</span>
                                        {isUploading ? 'Subiendo...' : 'Seleccionar PDF'}
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            ) : (
                                <p className="text-silver text-sm italic py-4">No hay material adjunto para esta lección.</p>
                            )
                        )}
                    </div>

                    {/* Footer del Modal: Maestros Asignados */}
                    <div className="mt-12 pt-8 border-t border-bone flex flex-wrap gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-silver uppercase">Maestro 3-7</span>
                            <span className="font-semibold text-charcoal">{clase.maestros?.ninos_pequenos || 'Sin asignar'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-silver uppercase">Maestro 8-11</span>
                            <span className="font-semibold text-charcoal">{clase.maestros?.ninos_grandes || 'Sin asignar'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-silver uppercase">Adolescentes</span>
                            <span className="font-semibold text-charcoal">{clase.maestros?.adolescentes || 'Sin asignar'}</span>
                        </div>
                    </div>

                    {/* Footer Extra: Asistencia Registrada */}
                    {asistencia.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-bone">
                            <h4 className="text-xs font-bold text-primary uppercase mb-2">Asistencia Registrada ({asistencia.length} alumnos)</h4>
                            <p className="text-sm font-medium text-charcoal/60 italic">
                                La asistencia ha sido pasada para esta clase. (Ver detalles de alumnos en la pestaña Alumnos).
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassDetail;
