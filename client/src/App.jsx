import TaskPage from './pages/TaskPage';

function App() {
 // const isAuthenticated = /* read from state/context/localStorage */;
  return (
    <div className="min-h-screen bg-slate-900/5">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              TF
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">TaskFlow</p>
              <p className="text-[11px] text-slate-500">Personal task workspace</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <TaskPage />
      { /* {isAuthenticated ? <TaskPage /> : <AuthPage />}   // e.g. Login / Signup */}
      </main>
    </div>
  );
}

export default App;
