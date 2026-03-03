import React, { useState, useEffect } from 'react';

const TeacherSelectionView = ({ onSelectTeacher, onLoginClick, isAdmin, onLogout }) => {
    const [maestros, setMaestros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [pinError, setPinError] = useState('');
    const [enteredPin, setEnteredPin] = useState(['', '', '', '']);

    useEffect(() => {
        const fetchMaestros = async () => {
            try {
                const res = await fetch('/api/ministerio');
                const data = await res.json();
                if (data.ministerio_infantil?.maestros) {
                    setMaestros(data.ministerio_infantil.maestros);
                }
            } catch (err) {
                console.error("Error cargando maestros:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaestros();
    }, []);

    const getDummyImg = (id) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;

    const handleTeacherClick = (maestro) => {
        if (maestro.rol === 'Administrador' && !isAdmin) {
            setSelectedAdmin(maestro);
            setEnteredPin(['', '', '', '']);
            setPinError('');
        } else {
            onSelectTeacher(maestro);
        }
    };

    const handlePinChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newPin = [...enteredPin];
        newPin[index] = value;
        setEnteredPin(newPin);
        setPinError('');

        // Auto focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handlePinSubmit = () => {
        const pinString = enteredPin.join('');
        if (pinString.length !== 4) {
            setPinError('Ingresa los 4 dígitos');
            return;
        }

        if (pinString === selectedAdmin.pin) {
            onSelectTeacher(selectedAdmin);
            setSelectedAdmin(null);
        } else {
            setPinError('PIN incorrecto');
        }
    };

    const handlePinKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !enteredPin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        } else if (e.key === 'Enter') {
            handlePinSubmit();
        }
    };

    const filteredMaestros = maestros.filter(m =>
        m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) && m.activo
    );

    return (
        <div className="relative min-h-screen w-full bg-bone overflow-x-hidden pt-24 pb-12">
            {/* Header / Brand */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-effect bg-white/80 border-b border-gray-100 p-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="https://ia600104.us.archive.org/18/items/logo-1_202603/LOGO%201.png"
                        alt="Logo IBGV"
                        className="w-12 h-12 object-contain logo-blend"
                    />
                    <div>
                        <h1 className="text-sm font-black tracking-tighter text-charcoal leading-none">IBGV</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Escuela Infantil</p>
                    </div>
                </div>

                {isAdmin ? (
                    <button onClick={onLogout} className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                        <span className="material-symbols-outlined !text-xl notranslate">logout</span>
                    </button>
                ) : (
                    <button onClick={onLoginClick} className="size-10 flex items-center justify-center rounded-full bg-white text-charcoal/30 border border-gray-100 shadow-sm">
                        <span className="material-symbols-outlined !text-xl notranslate">admin_panel_settings</span>
                    </button>
                )}
            </header>

            <main className="max-w-4xl mx-auto px-6 space-y-8">
                <div className="text-center space-y-2 pt-4">
                    <h2 className="text-3xl font-black text-charcoal tracking-tight">¡Bienvenido!</h2>
                    <p className="text-silver font-medium">Selecciona tu nombre para ver tu programación</p>
                </div>

                {/* Buscador */}
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-silver transition-colors group-focus-within:text-primary notranslate">search</span>
                    <input
                        type="text"
                        placeholder="Busca tu nombre..."
                        className="w-full bg-white border-2 border-transparent shadow-xl shadow-charcoal/5 rounded-2xl py-4 pl-12 pr-4 text-charcoal font-bold focus:border-primary/20 focus:ring-0 transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Cuadrícula de Maestros */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-white/50 rounded-3xl border border-gray-100"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-20">
                        {filteredMaestros.map((maestro) => (
                            <button
                                key={maestro.id}
                                onClick={() => handleTeacherClick(maestro)}
                                className="group relative flex flex-col items-center bg-white p-4 pt-6 rounded-[2.5rem] shadow-xl shadow-charcoal/5 border border-white hover:border-primary/20 transition-all active:scale-[0.97]"
                            >
                                <div className="relative size-20 mb-4 rounded-3xl overflow-hidden bg-bone border border-gray-100 group-hover:shadow-lg group-hover:shadow-primary/10 transition-shadow">
                                    <img
                                        src={maestro.foto_url || getDummyImg(maestro.id)}
                                        alt={maestro.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors"></div>
                                </div>
                                <span className="text-sm font-black text-charcoal mb-1 text-center group-hover:text-primary transition-colors">{maestro.nombre}</span>
                                <div className="size-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-primary !text-lg notranslate">arrow_forward</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de PIN */}
            {selectedAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/80 backdrop-blur-sm animate-in fade-in p-4 px-6 relative px-8">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95">
                        <button
                            onClick={() => setSelectedAdmin(null)}
                            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-bone text-charcoal/40 hover:text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined !text-lg notranslate">close</span>
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4 pt-2">
                            <div className="size-20 rounded-full overflow-hidden border border-gray-100 mb-2">
                                <img src={selectedAdmin.foto_url || getDummyImg(selectedAdmin.id)} alt={selectedAdmin.nombre} className="w-full h-full object-cover" />
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-charcoal leading-none">{selectedAdmin.nombre}</h3>
                                <p className="text-[10px] text-silver font-bold uppercase tracking-widest mt-2 bg-bone px-3 py-1 rounded-full inline-block">Acceso Restringido</p>
                            </div>

                            <div className="w-full pt-4">
                                <p className="text-sm font-bold text-charcoal/80 mb-4">Ingresa tu PIN de 4 dígitos</p>

                                <div className="flex justify-center gap-3 mb-2">
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            id={`pin-input-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={enteredPin[index]}
                                            onChange={(e) => handlePinChange(index, e.target.value)}
                                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                                            className="size-14 rounded-2xl bg-bone border-2 border-transparent focus:border-primary focus:bg-white text-center text-2xl font-black text-charcoal shadow-inner transition-all outline-none"
                                        />
                                    ))}
                                </div>

                                {pinError ? (
                                    <p className="text-xs font-bold text-red-500 animate-in slide-in-from-top-1 h-4">{pinError}</p>
                                ) : (
                                    <p className="h-4"></p>
                                )}
                            </div>

                            <button
                                onClick={handlePinSubmit}
                                className="w-full py-4 mt-2 bg-charcoal text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-charcoal/20 active:scale-95 transition-transform"
                            >
                                Entrar al Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherSelectionView;
