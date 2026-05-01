import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose, onLoginSuccess, selectedTeacher }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validar que hay un maestro seleccionado
        if (!selectedTeacher) {
            setError('Debes seleccionar un maestro primero para acceder al modo administrador.');
            setLoading(false);
            return;
        }

        // Validar que el maestro tiene PIN asignado
        if (!selectedTeacher.pin) {
            setError('Este usuario no tiene acceso administrativo (sin PIN asignado).');
            setLoading(false);
            return;
        }

        // Comparar el PIN ingresado con el PIN del maestro seleccionado
        if (pin.trim() === String(selectedTeacher.pin).trim()) {
            onLoginSuccess();
            onClose();
            setPin('');
            setError('');
        } else {
            setError('PIN incorrecto. Intenta de nuevo.');
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined text-4xl notranslate">lock_person</span>
                        </div>
                        <h2 className="text-2xl font-black text-charcoal">Modo Administrador</h2>
                        <p className="text-silver font-bold text-xs uppercase tracking-widest mt-1">Ingresa tu PIN de 4 dígitos</p>
                        {selectedTeacher && (
                            <p className="text-[11px] text-primary font-bold mt-2 bg-primary/5 px-3 py-1 rounded-full">
                                {selectedTeacher.nombre}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 ml-4">
                                PIN de Acceso (4 dígitos)
                            </label>
                            <input
                                required
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full h-14 bg-bone rounded-2xl px-5 font-bold text-charcoal outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center text-2xl tracking-[0.5em]"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-500">
                                <span className="material-symbols-outlined text-xl notranslate">error</span>
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || pin.length < 4}
                            className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Verificando...' : 'Desbloquear'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { onClose(); setPin(''); setError(''); }}
                            className="w-full h-12 text-silver font-bold text-sm hover:text-charcoal transition-colors"
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
