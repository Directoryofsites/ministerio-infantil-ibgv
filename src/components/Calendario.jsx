import React, { useState, useEffect } from 'react';

const Calendario = ({ onNavigate, onNewClass, onSelectClase, clases }) => {
    const [viewDate, setViewDate] = useState(new Date()); // Date to track which month we're viewing
    const [selectedDate, setSelectedDate] = useState(new Date()); // Date to track which day is selected

    // Helper to get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    // Helper to get first day of month (0-indexed, 0=Dom)
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const prevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const hasClassOnDay = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return (clases || []).some(clase => clase.rawFecha === dateStr);
    };

    const getClassesOnSelectedDay = () => {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        return (clases || []).filter(clase => clase.rawFecha === dateStr);
    };

    const selectedDayClasses = getClassesOnSelectedDay();

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-white border-x border-gray-100 fade-in animate-in">
            {/* Header */}
            <div className="flex items-center bg-white p-4 border-b border-gray-100 justify-between sticky top-0 z-10">
                <div className="flex size-20 items-center justify-center">
                    <img
                        src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                        alt="Logo IBGV"
                        className="w-full h-full object-contain logo-blend"
                    />
                </div>
                <div className="flex flex-col items-center flex-1">
                    <h2 className="text-charcoal text-lg font-bold leading-tight tracking-tight font-display">IBGV</h2>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-[0.15em]">Escuela Infantil</p>
                </div>
                <div className="flex w-10 items-center justify-end">
                    <button className="flex items-center justify-center rounded-full size-10 hover:bg-bone transition-colors" title="Sin notificaciones">
                        <span className="material-symbols-outlined text-charcoal/30 notranslate">notifications_off</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {/* Month Selector */}
                <div className="flex items-center px-6 py-4 justify-between">
                    <button onClick={prevMonth} className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary active:scale-90 transition-transform">
                        <span className="material-symbols-outlined notranslate">chevron_left</span>
                    </button>
                    <div className="text-center">
                        <p className="text-charcoal text-xl font-bold font-display">{monthNames[currentMonth]} {currentYear}</p>
                    </div>
                    <button onClick={nextMonth} className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary active:scale-90 transition-transform">
                        <span className="material-symbols-outlined notranslate">chevron_right</span>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="px-4">
                    <div className="grid grid-cols-7 mb-2">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                            <p key={d} className="text-silver text-xs font-bold uppercase tracking-wider flex h-8 items-center justify-center">{d}</p>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-2">
                        {/* Empty slots for alignment */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-14 w-full"></div>
                        ))}

                        {/* Real Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateObj = new Date(currentYear, currentMonth, day);
                            const active = isSameDay(dateObj, selectedDate);
                            const hasDot = hasClassOnDay(day);

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateObj)}
                                    className={`h-14 w-full flex flex-col items-center justify-center relative rounded-xl transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 z-10' : 'hover:bg-bone text-charcoal'
                                        }`}
                                >
                                    <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{day}</span>
                                    {hasDot && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${active ? 'bg-white' : 'bg-primary animate-pulse'}`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Summary Card */}
                <div className="p-4 mt-6">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-charcoal text-lg font-bold font-display">
                            {isSameDay(selectedDate, new Date()) ? 'Clases para Hoy' : `Clases para el ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {selectedDayClasses.length > 0 ? (
                            selectedDayClasses.map(clase => (
                                <div key={clase.id} className="flex flex-col rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden card-hover">
                                    <div className="p-4 bg-white z-10">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">{clase.fecha}</p>
                                                <h4 className="text-xl font-bold mb-2">{clase.leccion.titulo}</h4>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className="flex items-center gap-2 text-silver text-xs">
                                                <span className="font-bold text-charcoal/60">3-7:</span> {clase.maestros.ninos_pequenos}
                                            </div>
                                            <div className="flex items-center gap-2 text-silver text-xs">
                                                <span className="font-bold text-charcoal/60">8-11:</span> {clase.maestros.ninos_grandes}
                                            </div>
                                            <div className="flex items-center gap-2 text-silver text-xs">
                                                <span className="font-bold text-charcoal/60">Teens:</span> {clase.maestros.adolescentes}
                                            </div>
                                        </div>
                                        <button onClick={() => onSelectClase(clase)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                                            <span className="material-symbols-outlined text-lg notranslate">description</span>
                                            Ver Detalles de la Lección
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-bone/50 border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white shadow-soft">
                                <span className="material-symbols-outlined text-silver !text-4xl mb-2 notranslate">calendar_today</span>
                                <p className="text-silver text-sm font-medium">No hay clases programadas para este día.</p>
                                <button
                                    onClick={onNewClass}
                                    className="mt-4 text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    + Programar ahora
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-28"></div>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 glass-effect bg-white/90 border-t border-gray-100 pb-8 pt-3 px-6 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('teacher-selection')}>
                    <span className="material-symbols-outlined text-2xl notranslate">home</span>
                    <p className="text-[10px] font-medium leading-normal">Inicio</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-primary active" onClick={() => onNavigate('calendario')}>
                    <span className="material-symbols-outlined text-2xl fill-1 notranslate">calendar_month</span>
                    <p className="text-[10px] font-medium leading-normal flex-1 font-black uppercase tracking-widest mt-1">Calendario</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined text-2xl notranslate">menu_book</span>
                    <p className="text-[10px] font-medium leading-normal">Lecciones</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('reuniones')}>
                    <span className="material-symbols-outlined text-2xl notranslate">event</span>
                    <p className="text-[10px] font-medium leading-normal">Reuniones</p>
                </button>
                <button className="flex flex-col items-center gap-1 text-charcoal/40 hover:text-charcoal transition-colors" onClick={() => onNavigate('maestros')}>
                    <span className="material-symbols-outlined text-2xl notranslate">group</span>
                    <p className="text-[10px] font-medium leading-normal">Maestros</p>
                </button>
            </nav>
        </div>
    );
};

export default Calendario;
