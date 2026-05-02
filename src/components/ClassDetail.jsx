import React, { useState, useEffect } from 'react';

const ClassDetail = ({ clase, onClose, onEdit, onDelete, onDuplicate, isAdmin, onRefresh }) => {
    const [asistencia, setAsistencia] = useState([]);
    const [isUploadingFicha, setIsUploadingFicha] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingWord, setIsUploadingWord] = useState(false);
    const handleFichaUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') return alert('Solo se permiten archivos PDF');
        if (file.size > 5 * 1024 * 1024) return alert('El archivo es muy pesado. Máximo 5MB permitido.');

        setIsUploadingFicha(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch(`/api/programacion/${clase.id}/ficha`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pdf_base64: reader.result, pdf_nombre: file.name })
                });
                if (res.ok) {
                    if (onRefresh) onRefresh();
                    onClose();
                } else alert('Error al subir ficha');
            } catch (err) {
                console.error(err);
            } finally {
                setIsUploadingFicha(false);
            }
        };
    };

    const handleDeleteFicha = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar la ficha de esta lección?")) return;
        try {
            const res = await fetch(`/api/programacion/${clase.id}/ficha`, { method: 'DELETE' });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                } else alert('Error al subir material');
            } catch (err) {
                console.error(err);
            } finally {
                setIsUploading(false);
            }
        };
    };

    const handleDeletePdf = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar el material PDF de esta lección?")) return;
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

    const handleWordUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
            return alert('Solo se permiten archivos de Word (.doc, .docx)');
        }
        if (file.size > 5 * 1024 * 1024) return alert('El archivo es muy pesado. Máximo 5MB permitido.');

        setIsUploadingWord(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const res = await fetch(`/api/programacion/${clase.id}/word`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word_base64: reader.result, word_nombre: file.name })
                });
                if (res.ok) {
                    if (onRefresh) onRefresh();
                    onClose();
                } else alert('Error al subir planeación');
            } catch (err) {
                console.error(err);
            } finally {
                setIsUploadingWord(false);
            }
        };
    };

    const handleDeleteWord = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar la planeación de esta lección?")) return;
        try {
            const res = await fetch(`/api/programacion/${clase.id}/word`, { method: 'DELETE' });
            if (res.ok) {
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

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

                    {/* GESTIÓN DE ARCHIVOS (SUBIDAS Y DESCARGAS) */}
                    <div className="mt-12 space-y-12">
                        {/* 1. FICHA TÉCNICA (PDF) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-red-600">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Ficha Técnica (PDF)</h3>
                                <div className="h-px flex-1 bg-red-100"></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="size-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-red-500 notranslate">picture_as_pdf</span>
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-charcoal truncate">{clase.tiene_ficha_pdf ? clase.ficha_pdf_nombre : 'No hay ficha subida'}</p>
                                        <p className="text-xs text-silver font-medium uppercase tracking-widest">Resumen de la lección</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 shrink-0">
                                    {clase.tiene_ficha_pdf && (
                                        <>
                                            <a
                                                href={`/api/programacion/${clase.id}/ficha`}
                                                download={clase.ficha_pdf_nombre}
                                                className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined !text-lg notranslate">download</span>
                                                Descargar
                                            </a>
                                            <button onClick={handleDeleteFicha} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar Ficha">
                                                <span className="material-symbols-outlined !text-lg notranslate">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <label className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${isUploadingFicha ? 'opacity-50' : ''}`}>
                                        <span className="material-symbols-outlined !text-lg notranslate">publish</span>
                                        <span className="text-xs uppercase tracking-widest">{isUploadingFicha ? 'Subiendo...' : (clase.tiene_ficha_pdf ? 'Reemplazar' : 'Subir PDF')}</span>
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleFichaUpload} disabled={isUploadingFicha} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 2. MATERIAL ADJUNTO (PDF) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-primary">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Material Adjunto (PDF)</h3>
                                <div className="h-px flex-1 bg-primary/10"></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="size-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary notranslate">attachment</span>
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-charcoal truncate">{clase.tiene_pdf ? clase.pdf_nombre : 'Sin material adjunto'}</p>
                                        <p className="text-xs text-silver font-medium uppercase tracking-widest">Recursos para la clase</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 shrink-0">
                                    {clase.tiene_pdf && (
                                        <>
                                            <a
                                                href={`/api/programacion/${clase.id}/pdf`}
                                                download={clase.pdf_nombre}
                                                className="bg-primary/5 text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined !text-lg notranslate">download</span>
                                                Descargar
                                            </a>
                                            <button onClick={handleDeletePdf} className="p-3 text-primary hover:bg-primary/5 rounded-xl transition-colors" title="Eliminar Material">
                                                <span className="material-symbols-outlined !text-lg notranslate">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <label className={`bg-charcoal hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                                        <span className="material-symbols-outlined !text-lg notranslate">publish</span>
                                        <span className="text-xs uppercase tracking-widest">{isUploading ? 'Subiendo...' : (clase.tiene_pdf ? 'Reemplazar' : 'Subir PDF')}</span>
                                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 3. PLANEACIÓN LECCIÓN (WORD) */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-blue-600">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Planeación Lección (Word)</h3>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="size-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-blue-500 notranslate">description</span>
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-charcoal truncate">{clase.tiene_word ? clase.word_nombre : 'Sin planeación subida'}</p>
                                        <p className="text-xs text-silver font-medium uppercase tracking-widest">Documento de trabajo</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 shrink-0">
                                    {clase.tiene_word && (
                                        <>
                                            <a
                                                href={`/api/programacion/${clase.id}/word`}
                                                download={clase.word_nombre}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined !text-lg notranslate">download</span>
                                                Descargar
                                            </a>
                                            <button onClick={handleDeleteWord} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Eliminar Planeación">
                                                <span className="material-symbols-outlined !text-lg notranslate">delete</span>
                                            </button>
                                        </>
                                    )}
                                    <label className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${isUploadingWord ? 'opacity-50' : ''}`}>
                                        <span className="material-symbols-outlined !text-lg notranslate">publish</span>
                                        <span className="text-xs uppercase tracking-widest">{isUploadingWord ? 'Subiendo...' : (clase.tiene_word ? 'Reemplazar' : 'Subir Word')}</span>
                                        <input type="file" accept=".doc,.docx" className="hidden" onChange={handleWordUpload} disabled={isUploadingWord} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isAdmin && !clase.tiene_pdf && !clase.tiene_word && !clase.tiene_ficha_pdf && (
                        <div className="mt-10 py-10 bg-bone rounded-3xl text-center">
                            <span className="material-symbols-outlined !text-5xl text-silver/30 mb-4 notranslate">folder_off</span>
                            <p className="text-silver font-bold uppercase tracking-widest text-xs">No hay material disponible para esta lección</p>
                        </div>
                    )}

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
