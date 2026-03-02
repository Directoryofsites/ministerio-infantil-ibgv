import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Maestros from './components/Maestros';
import MaestroForm from './components/MaestroForm';
import ClassForm from './ClassForm';
import ClassDetail from './components/ClassDetail';
import Calendario from './components/Calendario';
import ObservacionesModal from './components/ObservacionesModal';
import Reportes from './components/Reportes';
import Estudiantes from './components/Estudiantes';
import EstudianteForm from './components/EstudianteForm';
import LoginModal from './components/LoginModal';
import TeacherSelectionView from './components/TeacherSelectionView';
import TeacherScheduleView from './components/TeacherScheduleView';
import AsistenciaView from './components/AsistenciaView';
import ReunionesView from './components/ReunionesView';

function App() {
  const [currentView, setCurrentView] = useState('teacher-selection'); // 'teacher-selection', 'teacher-schedule', 'asistencia', 'dashboard', 'maestros', 'calendario'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [clases, setClases] = useState([]);
  const [reuniones, setReuniones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClase, setEditingClase] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);
  const [showMaestroForm, setShowMaestroForm] = useState(false);
  const [editingMaestro, setEditingMaestro] = useState(null);
  const [observationsClase, setObservationsClase] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [showEstudianteForm, setShowEstudianteForm] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('ibgv_admin') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('ibgv_admin', isAdmin);
  }, [isAdmin]);

  const fetchClases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ministerio');
      const data = await res.json();
      if (data.ministerio_infantil?.programacion) {
        setClases(data.ministerio_infantil.programacion);
      }
      if (data.ministerio_infantil?.estudiantes) {
        setEstudiantes(data.ministerio_infantil.estudiantes);
      }
      if (data.ministerio_infantil?.reuniones) {
        setReuniones(data.ministerio_infantil.reuniones);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClases();
  }, []);

  const handleSaveClass = async (claseData) => {
    try {
      const method = claseData.id ? 'PUT' : 'POST';
      const url = claseData.id ? `/api/programacion/${claseData.id}` : '/api/programacion';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claseData),
      });

      if (!res.ok) throw new Error('Error al guardar la clase');
      setShowClassForm(false);
      fetchClases();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteClass = async (clase) => {
    if (window.confirm(`¿Seguro que deseas eliminar la clase del ${clase.fecha}?`)) {
      try {
        const res = await fetch(`/api/programacion/${clase.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        setSelectedClase(null);
        fetchClases();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveMaestro = async (maestroData) => {
    try {
      const method = maestroData.id ? 'PUT' : 'POST';
      const url = maestroData.id ? `/api/maestros/${maestroData.id}` : '/api/maestros';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maestroData)
      });
      if (!res.ok) throw new Error('Error al guardar maestro');
      setShowMaestroForm(false);
      // No strict need to fetchClases as Maestros.jsx fetches its own, but good for consistency
      fetchClases();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveObservations = async (claseId, text) => {
    try {
      const res = await fetch(`/api/programacion/${claseId}/observaciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observaciones: text })
      });
      if (!res.ok) throw new Error('Error al guardar reporte');
      setObservationsClase(null);
      fetchClases();
    } catch (err) {
      console.error(err);
      alert("Error al guardar las observaciones");
      throw err;
    }
  };

  const handleDuplicateClass = (clase) => {
    const formattedData = {
      ...clase,
      id: undefined,
      fecha: '',
      rawFecha: clase.rawFecha,
      leccion: {
        titulo: `${clase.leccion.titulo} (Copia)`,
        pasaje_biblico: clase.leccion.pasaje_biblico,
        enfasis_principal: clase.leccion.enfasis_principal,
        teologia_preparacion: clase.leccion.teologia_preparacion
      },
      rawAsignaciones: { ...clase.rawAsignaciones }
    };
    console.log(">>> CAMBIO selectedClase:", formattedData ? formattedData.leccion.titulo : "null");
    setEditingClase(formattedData);
    setShowClassForm(true);
    setSelectedClase(null);
  };

  const canManageContent = isAdmin || (selectedTeacher?.rol === 'Administrador');

  return (
    <div className="min-h-screen bg-bone font-display text-charcoal">
      {currentView === 'teacher-selection' && (
        <TeacherSelectionView
          onSelectTeacher={(m) => {
            setSelectedTeacher(m);
            setCurrentView('teacher-schedule');
          }}
          onLoginClick={() => setShowLoginModal(true)}
          isAdmin={isAdmin}
          onLogout={() => setIsAdmin(false)}
        />
      )}

      {currentView === 'teacher-schedule' && selectedTeacher && (
        <TeacherScheduleView
          teacher={selectedTeacher}
          clases={clases}
          onBack={() => setCurrentView('teacher-selection')}
          onSelectClase={setSelectedClase}
          onNavigate={setCurrentView}
          onEditObservations={setObservationsClase}
        />
      )}

      {currentView === 'asistencia' && selectedTeacher && (
        <AsistenciaView
          teacher={selectedTeacher}
          clases={clases}
          estudiantes={estudiantes}
          onBack={() => setCurrentView('teacher-schedule')}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          clases={clases}
          onSelectClase={setSelectedClase}
          onNavigate={setCurrentView}
          onNewClass={() => setShowClassForm(true)}
          onEditObservations={setObservationsClase}
          isAdmin={canManageContent}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={() => setIsAdmin(false)}
        />
      )}

      {currentView === 'reuniones' && (
        <ReunionesView
          reuniones={reuniones}
          onNavigate={setCurrentView}
          isAdmin={canManageContent}
          selectedTeacher={selectedTeacher}
          onRefresh={fetchClases}
        />
      )}

      {currentView === 'reportes' && (
        <Reportes
          clases={clases}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'estudiantes' && (
        <Estudiantes
          estudiantes={estudiantes}
          onNavigate={setCurrentView}
          onNewEstudiante={() => { setEditingEstudiante(null); setShowEstudianteForm(true); }}
          onEditEstudiante={(e) => { setEditingEstudiante(e); setShowEstudianteForm(true); }}
          isAdmin={canManageContent}
        />
      )}

      {currentView === 'maestros' && (
        <Maestros
          onNavigate={setCurrentView}
          onNewMaestro={() => {
            setEditingMaestro(null);
            setShowMaestroForm(true);
          }}
          onEditMaestro={(m) => {
            setEditingMaestro(m);
            setShowMaestroForm(true);
          }}
          onDeleteMaestro={async (m) => {
            if (window.confirm(`¿Seguro que deseas eliminar a ${m.nombre}?`)) {
              const res = await fetch(`/api/maestros/${m.id}`, { method: 'DELETE' });
              if (res.ok) {
                // Maestros.jsx fetches its own data
              } else {
                const err = await res.json();
                alert(err.error);
              }
            }
          }}
          isAdmin={isAdmin}
        />
      )}

      {currentView === 'calendario' && (
        <Calendario
          clases={clases}
          onNavigate={setCurrentView}
          onNewClass={() => setShowClassForm(true)}
          onSelectClase={(clase) => setSelectedClase(clase)}
        />
      )}

      {selectedClase && (
        <ClassDetail
          clase={selectedClase}
          onClose={() => setSelectedClase(null)}
          onEdit={(c) => {
            setEditingClase(c);
            setShowClassForm(true);
            setSelectedClase(null);
          }}
          onDelete={handleDeleteClass}
          onDuplicate={handleDuplicateClass}
          isAdmin={canManageContent}
          onRefresh={fetchClases}
        />
      )}

      {showClassForm && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <ClassForm
            claseToEdit={editingClase}
            showClassForm={showClassForm}
            onClose={() => { setShowClassForm(false); setEditingClase(null); }}
            onSaveSuccess={() => {
              setShowClassForm(false);
              setEditingClase(null);
              fetchClases();
            }}
          />
        </div>
      )}

      {showMaestroForm && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <MaestroForm
            maestroToEdit={editingMaestro}
            onClose={() => { setShowMaestroForm(false); setEditingMaestro(null); }}
            onSaveSuccess={() => {
              setShowMaestroForm(false);
              setEditingMaestro(null);
              fetchClases();
            }}
          />
        </div>
      )}

      {observationsClase && (
        <ObservacionesModal
          clase={observationsClase}
          teacher={selectedTeacher}
          onClose={() => setObservationsClase(null)}
        />
      )}

      {showEstudianteForm && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <EstudianteForm
            estudianteToEdit={editingEstudiante}
            onClose={() => setShowEstudianteForm(false)}
            onSaveSuccess={() => {
              setShowEstudianteForm(false);
              fetchClases();
            }}
          />
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}

export default App;
