import React, { useState, useEffect } from 'react';

const Maestros = ({ onNavigate, onNewMaestro, onEditMaestro, onDeleteMaestro, isAdmin, maestros, loading }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');

    const formatSpec = (spec) => {
        if (!spec) return "Sin asignar";
        const parts = spec.split(',');
        const labels = parts.map(p => {
            if (p === 'g1') return "3-7 años";
            if (p === 'g2') return "8-11 años";
            if (p === 'g3') return "Adolescentes";
            if (p === 'cuna') return "Cuna";
            return p;
        });
        return labels.join(' • ');
    };

    const getDummyImg = (id) => `https://i.pravatar.cc/150?u=${id}`;

    // Filtering logic
    const filteredMaestros = maestros.filter(m => {
        const matchesSearch = m.nombre.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Todos' || (m.especialidad && m.especialidad.split(',').includes(activeFilter));
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-bone border-x border-gray-200 fade-in animate-in">
            {/* Header Section */}
            <header className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="size-16 flex items-center justify-center">
                            <img
                                src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                                alt="Logo IBGV"
                                className="w-full h-full object-contain logo-blend"
                            />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-primary leading-none">IBGV</h1>
                            <p className="text-xs text-silver">Escuela Infantil</p>
                        </div>
                    </div>
                    <button className="size-10 flex items-center justify-center rounded-full bg-bone text-charcoal/30" title="Sin notificaciones">
                        <span className="material-symbols-outlined notranslate">notifications_off</span>
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-charcoal">Maestros</h2>
                    {isAdmin && (
                        <button
                            onClick={onNewMaestro}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-sm notranslate">add</span>
                            Nuevo Maestro
                        </button>
                    )}
                </div>
            </header>

            {/* Search & Filter Section */}
            <div className="px-4 py-4 space-y-3">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-silver notranslate">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-silver shadow-sm text-charcoal"
                        placeholder="Buscar por nombre o grupo..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { id: 'Todos', label: 'Todos' },
                        { id: 'cuna', label: 'Cuna' },
                        { id: 'g1', label: '3-7 años' },
                        { id: 'g2', label: '8-11 años' },
                        { id: 'g3', label: 'Adolescentes' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${activeFilter === filter.id
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-charcoal border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Teacher List Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-silver px-1 pt-2">
                    {activeFilter === 'Todos' ? 'Equipo Activo' : `Filtrado: ${activeFilter}`} ({filteredMaestros.length})
                </h3>

                {loading ? (
                    <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-silver text-sm animate-pulse">Cargando maestros...</p>
                    </div>
                ) : filteredMaestros.length > 0 ? (
                    filteredMaestros.map((maestro) => (
                        <div key={maestro.id} className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-gray-50 card-hover">
                            <div className="size-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                                <img
                                    src={maestro.foto_url || getDummyImg(maestro.id)}
                                    alt={maestro.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = getDummyImg(maestro.id); }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-charcoal truncate">{maestro.nombre}</h4>
                                <div className="flex items-center gap-1.5">
                                    <span className={`size-2 rounded-full ${maestro.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <p className="text-[10px] text-silver font-medium">{formatSpec(maestro.especialidad)}</p>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === maestro.id ? null : maestro.id);
                                        }}
                                        className="text-silver hover:text-charcoal transition-colors p-1"
                                    >
                                        <span className="material-symbols-outlined notranslate">more_vert</span>
                                    </button>

                                    {activeMenu === maestro.id && (
                                        <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 flex flex-col animate-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditMaestro(maestro);
                                                    setActiveMenu(null);
                                                }}
                                                className="px-4 py-2 text-sm text-charcoal hover:bg-bone text-left flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm notranslate">edit</span>
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteMaestro(maestro);
                                                    setActiveMenu(null);
                                                }}
                                                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm notranslate">delete</span>
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-soft">
                        <span className="material-symbols-outlined text-silver !text-4xl mb-2 notranslate">person_search</span>
                        <p className="text-silver text-sm">No se encontraron maestros con esos criterios.</p>
                    </div>
                )}

                <div className="h-20"></div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('teacher-selection')}>
                    <span className="material-symbols-outlined text-2xl notranslate">home</span>
                    <p className="text-[10px] font-medium leading-normal">Inicio</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined text-2xl notranslate">menu_book</span>
                    <p className="text-[10px] font-medium leading-normal">Lecciones</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reuniones')}>
                    <span className="material-symbols-outlined text-2xl notranslate">event</span>
                    <p className="text-[10px] font-medium leading-normal">Reuniones</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary active" onClick={() => onNavigate('maestros')}>
                    <span className="material-symbols-outlined text-2xl fill-1 notranslate">group</span>
                    <p className="text-[10px] font-medium leading-normal flex-1 font-black uppercase tracking-widest mt-1">Maestros</p>
                </button>
            </nav>
        </div>
    );
};

export default Maestros;
