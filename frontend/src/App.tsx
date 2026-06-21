import { useState, useEffect } from 'react';
import type { Problem, DashboardStats } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProblemsGrid } from './components/ProblemsGrid';
import { NotesModal } from './components/NotesModal';
import { RefreshCw, BookOpen, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'tracker'>('tracker');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Grid Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');


  
  // Modals & Loaders
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  // Fetch initial data
  const loadData = async (topicFilter: string | null = null) => {
    try {
      setLoading(true);
      // Fetch all problems or filtered by topic
      const probUrl = topicFilter 
        ? `${API_BASE_URL}/api/problems?topic=${encodeURIComponent(topicFilter)}`
        : `${API_BASE_URL}/api/problems`;
      
      const probRes = await fetch(probUrl);
      const probData = await probRes.json();
      setProblems(probData);

      // Fetch dashboard stats
      const statsRes = await fetch(`${API_BASE_URL}/api/dashboard`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data from API:', err);
      showNotification('Failed to connect to backend server. Make sure FastAPI is running on port 8000.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedTopic);
  }, [selectedTopic]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handler for problem progress updates (completion, revision count, notes)
  const handleUpdateProblem = async (id: number, updates: Partial<Problem>) => {
    try {
      // Find current problem locally to optimistic update or just build full body
      const current = problems.find(p => p.id === id);
      if (!current) return;

      const response = await fetch(`${API_BASE_URL}/api/problems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update problem on server');
      
      const updatedProblem = await response.json();
      
      // Update local problems state
      setProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));

      // Refetch dashboard stats to update streaks and completion ratios
      const statsRes = await fetch(`${API_BASE_URL}/api/dashboard`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error updating problem:', err);
      showNotification('Failed to update progress. Please check server connection.', 'error');
    }
  };

  // Open Notes Modal
  const handleEditNotes = (problem: Problem) => {
    setEditingProblem(problem);
  };

  // Save Notes from Modal
  const handleSaveNotes = (id: number, notes: string) => {
    handleUpdateProblem(id, { notes });
  };

  // Trigger Assignments Scraper
  const handleTriggerImport = async () => {
    try {
      setImportLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/import`, { method: 'POST' });
      if (!res.ok) throw new Error('Importer service failed');
      const data = await res.json();
      showNotification(data.message, 'success');
      // Reload everything
      await loadData(selectedTopic);
    } catch (err) {
      console.error('Import error:', err);
      showNotification('Scraper import failed. Check server logs.', 'error');
    } finally {
      setImportLoading(false);
    }
  };

  // Trigger GitHub Progress Synchronization
  const handleTriggerSync = async () => {
    try {
      setSyncLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sync-user`, { method: 'POST' });
      if (!res.ok) throw new Error('Sync service failed');
      const data = await res.json();
      showNotification(data.message, 'success');
      // Reload everything
      await loadData(selectedTopic);
    } catch (err) {
      console.error('Sync error:', err);
      showNotification('GitHub sync failed. Check server logs.', 'error');
    } finally {
      setSyncLoading(false);
    }
  };


  // Change topic selection
  const handleSelectTopic = (topic: string | null) => {
    setSelectedTopic(topic);
    if (topic) {
      setActiveView('tracker');
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        topicProgress={stats?.topic_progress || []}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        activeView={activeView}
        setActiveView={setActiveView}
        onTriggerImport={handleTriggerImport}
        importLoading={importLoading}
        onTriggerSync={handleTriggerSync}
        syncLoading={syncLoading}
      />


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-zinc-900 px-8 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-zinc-500 font-semibold text-sm">Workspace</span>
            <span className="text-zinc-700">/</span>
            <h1 className="text-sm font-bold text-zinc-100">
              {activeView === 'dashboard' ? 'Dashboard Overview' : 'DSA Tracker'}
            </h1>
            {selectedTopic && (
              <>
                <span className="text-zinc-700">/</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-400 font-bold border border-indigo-500/20">
                  {selectedTopic}
                </span>
              </>
            )}
          </div>

          {/* Quick Metrics Header */}
          {stats && (
            <div className="hidden sm:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-xs">
                <BookOpen className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-400 font-medium">Total:</span>
                <span className="font-bold text-zinc-200">{stats.total_questions}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <CheckCircle className="h-4 w-4 text-indigo-500" />
                <span className="text-zinc-400 font-medium">Solved:</span>
                <span className="font-bold text-indigo-400">{stats.solved_questions}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-zinc-400 font-medium">Streak:</span>
                <span className="font-bold text-orange-400">{stats.current_streak} days 🔥</span>
              </div>
            </div>
          )}
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div className={`absolute top-16 right-8 z-40 p-4 rounded-md shadow-lg border text-sm max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Dynamic View Panel */}
        <div className="flex-1 flex flex-col p-8 overflow-hidden min-h-0 bg-zinc-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="text-zinc-400 text-sm font-medium">Loading tracker environment...</span>
            </div>
          ) : activeView === 'dashboard' ? (
            <Dashboard 
              stats={stats} 
              onSelectTopic={handleSelectTopic}
              selectedTopic={selectedTopic}
            />
          ) : (
            <ProblemsGrid
              problems={problems}
              onUpdateProblem={handleUpdateProblem}
              onEditNotes={handleEditNotes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />


          )}
        </div>
      </main>

      {/* Notes Modal */}
      <NotesModal
        problem={editingProblem}
        isOpen={editingProblem !== null}
        onClose={() => setEditingProblem(null)}
        onSave={handleSaveNotes}
      />
    </div>
  );
}

export default App;
