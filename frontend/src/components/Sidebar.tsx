import React from 'react';
import type { TopicProgress } from '../types';
import { LayoutDashboard, ListTodo, RefreshCw, Database, Layers, GitBranch } from 'lucide-react';


interface SidebarProps {
  topicProgress: TopicProgress[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  activeView: 'dashboard' | 'tracker';
  setActiveView: (view: 'dashboard' | 'tracker') => void;
  onTriggerImport: () => void;
  importLoading: boolean;
  onTriggerSync: () => void;
  syncLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  topicProgress,
  selectedTopic,
  onSelectTopic,
  activeView,
  setActiveView,
  onTriggerImport,
  importLoading,
  onTriggerSync,
  syncLoading,
}) => {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full shrink-0">
      {/* Branding */}
      <div className="h-14 border-b border-zinc-900 flex items-center px-6 space-x-2.5">
        <div className="h-7 w-7 rounded bg-indigo-650 flex items-center justify-center font-bold text-sm text-zinc-100 shadow-md">
          DF
        </div>
        <span className="font-semibold text-base tracking-wide text-zinc-100">DSAForge</span>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-1">
        <button
          onClick={() => {
            setActiveView('dashboard');
            onSelectTopic(null);
          }}
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-150 ${
            activeView === 'dashboard' && !selectedTopic
              ? 'bg-zinc-900 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5 mr-2.5" />
          Dashboard
        </button>

        <button
          onClick={() => {
            setActiveView('tracker');
          }}
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-150 ${
            activeView === 'tracker'
              ? 'bg-zinc-900 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
          }`}
        >
          <ListTodo className="h-4.5 w-4.5 mr-2.5" />
          Tracker
        </button>
      </div>

      {/* Divider */}
      <div className="px-4 py-2 border-t border-zinc-900 mt-2">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Layers className="h-3 w-3" /> Topics
        </div>
        
        {/* Dynamic Topic List */}
        <div className="space-y-0.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          <button
            onClick={() => {
              setActiveView('tracker');
              onSelectTopic(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition duration-150 font-medium ${
              selectedTopic === null && activeView === 'tracker'
                ? 'bg-indigo-950/20 text-indigo-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <span>All Topics</span>
          </button>
          
          {topicProgress.map((tp) => (
            <button
              key={tp.topic}
              onClick={() => {
                setActiveView('tracker');
                onSelectTopic(tp.topic);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition duration-150 font-medium ${
                selectedTopic === tp.topic && activeView === 'tracker'
                  ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              <span className="truncate pr-2">{tp.topic}</span>
              <span className="text-[10px] shrink-0 font-semibold px-1 py-0.5 rounded bg-zinc-900 text-zinc-400">
                {tp.solved}/{tp.total}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="grow"></div>

      {/* Sync Footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 space-y-2">
        <div className="text-[10px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Core Services</span>
        </div>
        <button
          onClick={onTriggerImport}
          disabled={importLoading || syncLoading}
          className="w-full flex items-center justify-center py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-md text-xs font-semibold shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${importLoading ? 'animate-spin' : ''}`} />
          {importLoading ? 'Reloading...' : 'Reload Curriculum'}
        </button>

        <button
          onClick={onTriggerSync}
          disabled={importLoading || syncLoading}
          className="w-full flex items-center justify-center py-2 px-3 border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-400 hover:text-indigo-300 rounded-md text-xs font-semibold shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitBranch className={`h-3.5 w-3.5 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
          {syncLoading ? 'Syncing...' : 'Sync GitHub Progress'}
        </button>

      </div>

    </aside>
  );
};
