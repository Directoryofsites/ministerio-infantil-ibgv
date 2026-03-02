import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                onLoginSuccess();
                onClose();
            } else {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined text-4xl">lock_person</span>
                        </div>
                        <h2 className="text-2xl font-black text-charcoal">Modo Administrador</h2>
                        <p className="text-silver font-bold text-xs uppercase tracking-widest mt-1">Ingresa tus credenciales</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 ml-4">Usuario</label>
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-14 bg-bone rounded-2xl px-5 font-bold text-charcoal outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ej: admin"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 ml-4">Contraseña</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-14 bg-bone rounded-2xl px-5 font-bold text-charcoal outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-500">
                                <span className="material-symbols-outlined text-xl">error</span>
                                <p className="text-xs font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
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
