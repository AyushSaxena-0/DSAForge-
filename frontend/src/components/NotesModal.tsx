import React, { useState, useEffect } from 'react';
import type { Problem } from '../types';
import { X, FileText } from 'lucide-react';

interface NotesModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, notes: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  problem,
  isOpen,
  onClose,
  onSave,
}) => {
  const [notesText, setNotesText] = useState('');

  // Sync state with selected problem notes
  useEffect(() => {
    if (problem) {
      setNotesText(problem.notes || '');
    }
  }, [problem]);

  if (!isOpen || !problem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(problem.id, notesText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center space-x-2.5">
            <FileText className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">
              Edit Notes
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Problem
            </label>
            <div className="text-zinc-200 text-sm font-semibold">
              {problem.leetcode_number !== 'NA' ? `${problem.leetcode_number}. ` : ''}
              {problem.problem_name}
            </div>
            <div className="text-zinc-500 text-xs font-semibold">
              Topic: {problem.topic} | Difficulty: {problem.difficulty}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Your Notes / Review Guide
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="E.g., Write down time complexities, space complexities, key observations, or tricky test cases..."
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 resize-none font-sans"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md text-xs font-semibold shadow-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow transition"
            >
              Save Notes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
