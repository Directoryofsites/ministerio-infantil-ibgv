import React from 'react';

const Dashboard = ({ clases, onSelectClase, onNavigate, onNewClass, onEditObservations, isAdmin, onLoginClick, onLogout }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pt-20">
            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <img
                                src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                                alt="Logo IBGV"
                                className="w-full h-full object-contain relative z-10 logo-blend"
                            />
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold tracking-tight text-charcoal leading-tight">IBGV</h1>
                            <p className="text-[9px] text-primary font-bold uppercase tracking-[0.15em]">Escuela Infantil</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-charcoal/60 border border-gray-100 hover:bg-gray-100 transition-colors">
                            <span className="material-symbols-outlined !text-xl">search</span>
                        </button>
                        {isAdmin ? (
                            <button
                                onClick={onLogout}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                title="Cerrar Sesión Admin"
                            >
                                <span className="material-symbols-outlined !text-xl">logout</span>
                            </button>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-bone text-charcoal/40 border border-gray-100 hover:bg-bone transition-colors"
                                title="Acceso Admin"
                            >
                                <span className="material-symbols-outlined !text-xl">admin_panel_settings</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-5 pb-28 space-y-7">

                {isAdmin && (
                    <section>
                        <div className="relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 shadow-soft">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-[2px] w-6 bg-primary"></div>
                                    <h2 className="text-xs font-black uppercase tracking-widest text-primary">Próximos Eventos</h2>
                                </div>
                                <p className="text-xl font-extrabold text-charcoal mb-6">Gestiona tus clases hoy</p>
                                <button
                                    className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-[#a6191e] text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                                    onClick={onNewClass}
                                >
                                    <span className="material-symbols-outlined !text-xl">add_circle</span>
                                    <span className="tracking-wide">NUEVA CLASE</span>
                                </button>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 pointer-events-none">
                                <span className="material-symbols-outlined !text-[140px] text-charcoal">auto_stories</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* LISTA DE CLASES */}
                <section className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40">Calendario de Clases</h3>
                        <span
                            className="text-xs font-bold text-primary cursor-pointer hover:underline"
                            onClick={() => onNavigate('calendario')}
                        >
                            Ver todo
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {clases.map((clase) => (
                            <div
                                key={clase.id}
                                className="card-hover flex flex-col rounded-2xl bg-white border border-gray-100 p-5 transition-all shadow-soft cursor-pointer"
                                onClick={() => onSelectClase && onSelectClase(clase)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 pr-4">
                                        <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest">{clase.fecha}</p>
                                        <h4 className="text-lg font-extrabold text-charcoal leading-tight mb-1">{clase.leccion.titulo}</h4>
                                        <div className="flex items-center gap-1.5 text-silver">
                                            <span className="material-symbols-outlined !text-[14px]">menu_book</span>
                                            <p className="text-xs font-medium">{clase.leccion.pasaje_biblico}</p>
                                        </div>
                                    </div>
                                    {/* Placeholder icon square instead of arbitrary image */}
                                    <div className="w-14 h-14 rounded-xl bg-bone border border-gray-100 flex items-center justify-center text-primary/20 shrink-0 shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                        <span className="material-symbols-outlined !text-2xl relative z-10">church</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-1 pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-3.5 bg-gray-200 rounded-full"></div>
                                            <span className="text-charcoal/50 font-semibold text-xs uppercase tracking-wider">3-7 años</span>
                                        </div>
                                        <span className="font-bold text-charcoal/90">{clase.maestros?.ninos_pequenos || 'Sin asignar'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-3.5 bg-gray-200 rounded-full"></div>
                                            <span className="text-charcoal/50 font-semibold text-xs uppercase tracking-wider">8-11 años</span>
                                        </div>
                                        <span className="font-bold text-charcoal/90">{clase.maestros?.ninos_grandes || 'Sin asignar'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-3.5 bg-gray-200 rounded-full"></div>
                                            <span className="text-charcoal/50 font-semibold text-xs uppercase tracking-wider">Adolescentes</span>
                                        </div>
                                        <span className="font-bold text-charcoal/90">{clase.maestros?.adolescentes || 'Sin asignar'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {clases.length === 0 && (
                            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-soft">
                                <p className="text-silver text-sm">No hay clases programadas de momento.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-primary transition-colors" onClick={() => onNavigate('teacher-selection')}>
                    <span className="material-symbols-outlined !text-[26px]">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary nav-indicator active" onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined !text-[26px] fill-1">menu_book</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Lecciones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reuniones')}>
                    <span className="material-symbols-outlined !text-[26px]">event</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Reuniones</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('estudiantes')}>
                    <span className="material-symbols-outlined !text-[26px]">school</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Alumnos</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reportes')}>
                    <span className="material-symbols-outlined !text-[26px]">bar_chart</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Reportes</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('maestros')}>
                    <span className="material-symbols-outlined !text-[26px]">group</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Maestros</span>
                </button>
            </nav>
        </div >
    );
};

export default Dashboard;
