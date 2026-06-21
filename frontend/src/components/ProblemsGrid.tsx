import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { themeQuartz, colorSchemeDark } from 'ag-grid-community';
import type { Problem } from '../types';
import { ExternalLink, Edit2, Plus, Minus, Search, CheckCircle2, Circle } from 'lucide-react';

interface ProblemsGridProps {
  problems: Problem[];
  onUpdateProblem: (id: number, updates: Partial<Problem>) => void;
  onEditNotes: (problem: Problem) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}


export const ProblemsGrid: React.FC<ProblemsGridProps> = ({
  problems,
  onUpdateProblem,
  onEditNotes,
  searchTerm,
  setSearchTerm,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedStatus,
  setSelectedStatus,
}) => {

  
  // Filter problems locally for instant response
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      // Search term filter safely handling nulls
      const probName = prob.problem_name || '';
      const leetcodeNum = prob.leetcode_number || '';
      
      const matchesSearch = probName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leetcodeNum.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Difficulty filter
      const probDiff = prob.difficulty || 'NA';
      const matchesDifficulty = selectedDifficulty === 'All' || probDiff === selectedDifficulty;
      
      // Status filter
      let matchesStatus = true;
      if (selectedStatus === 'Solved') {
        matchesStatus = prob.completed;
      } else if (selectedStatus === 'Unsolved') {
        matchesStatus = !prob.completed;
      }
      
      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchTerm, selectedDifficulty, selectedStatus]);



  // Column Definitions
  const columnDefs = useMemo<ColDef<Problem>[]>(() => [
    {
      headerName: '✓',
      field: 'completed',
      width: 55,
      pinned: 'left',
      resizable: false,
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data) return null;
        return (
          <div className="flex items-center justify-center h-full w-full">
            <button
              onClick={() => onUpdateProblem(data.id, { completed: !data.completed })}
              className="text-zinc-500 hover:text-indigo-400 transition"
            >
              {data.completed ? (
                <CheckCircle2 className="h-5 w-5 text-indigo-500 fill-indigo-950/40" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-700" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      headerName: 'ID',
      field: 'leetcode_number',
      width: 75,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const val = params.value;
        if (val === 'NA' || !val) {
          return <span className="text-zinc-600 font-medium">NA</span>;
        }
        return <span className="text-zinc-300 font-bold">{val}</span>;
      },
    },
    {
      headerName: 'Problem Name',
      field: 'problem_name',
      minWidth: 250,
      flex: 1,
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data) return null;
        return (
          <div className="font-medium text-zinc-100 py-1 leading-snug">
            {data.problem_name || ''}
          </div>
        );
      },
    },
    {
      headerName: 'Topic',
      field: 'topic',
      width: 140,
      cellRenderer: (params: any) => (
        <span className="text-zinc-400 font-medium text-xs">{params.value}</span>
      ),
    },
    {
      headerName: 'Difficulty',
      field: 'difficulty',
      width: 110,
      cellRenderer: (params: any) => {
        const diff = params.value;
        let colorClass = 'bg-zinc-800/40 text-zinc-400 border-zinc-700';
        if (diff === 'Easy') {
          colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        } else if (diff === 'Medium') {
          colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        } else if (diff === 'Hard') {
          colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        }
        return (
          <div className="flex items-center h-full">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
              {diff || 'NA'}
            </span>
          </div>
        );
      },
    },
    {
      headerName: 'Revision',
      field: 'revision_count',
      width: 115,
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data) return null;
        return (
          <div className="flex items-center space-x-2.5 h-full">
            <button
              onClick={() => onUpdateProblem(data.id, { revision_count: Math.max(0, data.revision_count - 1) })}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-bold text-zinc-200 min-w-[14px] text-center">
              {data.revision_count}
            </span>
            <button
              onClick={() => onUpdateProblem(data.id, { revision_count: data.revision_count + 1 })}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        );
      },
    },
    {
      headerName: 'Notes',
      field: 'notes',
      width: 250,
      cellRenderer: (params: any) => {
        const data = params.data;
        if (!data) return null;
        return (
          <div 
            onClick={() => onEditNotes(data)}
            className="flex items-center justify-between w-full h-full cursor-pointer group pr-2"
          >
            <span className="truncate text-zinc-400 text-xs italic grow mr-2">
              {data.notes || 'Click to add notes...'}
            </span>
            <Edit2 className="h-3.5 w-3.5 text-zinc-600 group-hover:text-indigo-400 transition shrink-0 opacity-0 group-hover:opacity-100" />
          </div>
        );
      },
    },
    {
      headerName: 'Link',
      field: 'direct_url',
      width: 80,
      cellRenderer: (params: any) => {
        const url = params.value;
        if (!url) return <span className="text-zinc-650 font-medium text-xs">NA</span>;
        return (
          <div className="flex items-center justify-center h-full w-full">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-indigo-500 hover:bg-indigo-550/10 transition text-zinc-400 hover:text-indigo-400"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        );
      },
    },
    {
      headerName: 'Date Solved',
      field: 'date_solved',
      width: 120,
      cellRenderer: (params: any) => {
        const val = params.value;
        return <span className="text-zinc-400 text-xs font-semibold">{val || '—'}</span>;
      },
    },
  ], [onUpdateProblem, onEditNotes]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: false,
  }), []);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by problem name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-zinc-700 font-medium"
            >
              <option value="All">All Problems</option>
              <option value="Solved">Completed</option>
              <option value="Unsolved">Incomplete</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-zinc-700 font-medium"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="NA">Conceptual/NA</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid Container */}
      <div className="grow bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden relative shadow-inner min-h-[400px]">
        <div className="absolute inset-0">
          <AgGridReact
            rowData={filteredProblems}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={42}
            headerHeight={36}
            animateRows={false}
            suppressCellFocus={false}
            theme={themeQuartz.withPart(colorSchemeDark).withParams({
              backgroundColor: '#09090b',
              foregroundColor: '#f4f4f5',
              headerBackgroundColor: '#18181b',
              headerTextColor: '#a1a1aa',
              borderColor: '#27272a',
              oddRowBackgroundColor: '#09090b',
              selectedRowBackgroundColor: '#1e1b4b',
              rowHoverColor: '#18181b',
              accentColor: '#6366f1',
              borderRadius: 6,
            })}
          />
        </div>
      </div>
      
      {/* Row Count Footer */}
      <div className="flex justify-between items-center text-xs text-zinc-500 font-medium px-1">
        <span>Showing {filteredProblems.length} of {problems.length} problems</span>
        <span>Use arrow keys to navigate the grid</span>
      </div>
    </div>
  );
};
