import React from 'react';
import type { DashboardStats } from '../types';
import { Award, Flame, CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats | null;
  onSelectTopic: (topic: string | null) => void;
  selectedTopic: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onSelectTopic, selectedTopic }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const {
    total_questions,
    solved_questions,
    remaining_questions,
    completion_percentage,
    current_streak,
    longest_streak,
    difficulty_breakdown,
    recent_activity,
  } = stats;

  const difficultyCards = [
    {
      name: 'Easy',
      solved: difficulty_breakdown.easy_solved,
      total: difficulty_breakdown.easy,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      barColor: 'bg-emerald-500',
    },
    {
      name: 'Medium',
      solved: difficulty_breakdown.medium_solved,
      total: difficulty_breakdown.medium,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      barColor: 'bg-amber-500',
    },
    {
      name: 'Hard',
      solved: difficulty_breakdown.hard_solved,
      total: difficulty_breakdown.hard,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      barColor: 'bg-rose-500',
    },
    {
      name: 'Conceptual/NA',
      solved: difficulty_breakdown.na_solved,
      total: difficulty_breakdown.na,
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-500/10',
      borderColor: 'border-zinc-500/20',
      barColor: 'bg-zinc-500',
    },
  ];

  return (
    <div className="space-y-6 overflow-y-auto max-h-full pr-2">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between shadow-lg transition duration-200 hover:border-zinc-700">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completion</span>
            <h3 className="text-3xl font-bold mt-1 text-zinc-100">{completion_percentage}%</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {solved_questions} / {total_questions} Solved
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <CheckCircle className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between shadow-lg transition duration-200 hover:border-zinc-700">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Streak</span>
            <h3 className="text-3xl font-bold mt-1 text-zinc-100 flex items-center gap-2">
              {current_streak} <span className="text-sm font-normal text-zinc-400">days</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Keep solving daily!</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between shadow-lg transition duration-200 hover:border-zinc-700">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Longest Streak</span>
            <h3 className="text-3xl font-bold mt-1 text-zinc-100 flex items-center gap-2">
              {longest_streak} <span className="text-sm font-normal text-zinc-400">days</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Your personal best</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Award className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Remaining Questions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex items-center justify-between shadow-lg transition duration-200 hover:border-zinc-700">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Remaining</span>
            <h3 className="text-3xl font-bold mt-1 text-zinc-100">{remaining_questions}</h3>
            <p className="text-xs text-zinc-400 mt-1">Questions to go</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <BookOpen className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Difficulty Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {difficultyCards.map((card) => {
            const pct = card.total > 0 ? Math.round((card.solved / card.total) * 100) : 0;
            return (
              <div key={card.name} className={`p-4 rounded-lg border ${card.borderColor} ${card.bgColor} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${card.color}`}>{card.name}</span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {card.solved}/{card.total} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${card.barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic-wise Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-lg lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">Topic-wise Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
            {stats.topic_progress.map((topic) => (
              <div 
                key={topic.topic} 
                onClick={() => onSelectTopic(selectedTopic === topic.topic ? null : topic.topic)}
                className={`p-3 rounded-lg border transition duration-200 cursor-pointer ${
                  selectedTopic === topic.topic 
                    ? 'bg-indigo-650/10 border-indigo-500/50' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="font-medium text-zinc-200 truncate">{topic.topic}</span>
                  <span className="text-xs text-zinc-400 font-semibold shrink-0">
                    {topic.solved}/{topic.total} ({topic.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> Recent Solves
            </h2>
            {recent_activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-sm">
                <AlertCircle className="h-8 w-8 mb-2 text-zinc-600" />
                <p>No questions solved yet.</p>
                <p className="text-xs mt-1 text-zinc-600">Mark questions complete in the tracker!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent_activity.map((prob) => (
                  <div key={prob.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-zinc-200 truncate pr-2 max-w-[170px]" title={prob.problem_name}>
                        {prob.leetcode_number !== 'NA' ? `${prob.leetcode_number}. ` : ''}{prob.problem_name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        prob.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                      <span className="truncate max-w-[120px]">{prob.topic}</span>
                      <span>Solved: {prob.date_solved}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-zinc-500 mt-4 text-center border-t border-zinc-800 pt-3">
            Keep pushing! Every problem counts.
          </div>
        </div>
      </div>
    </div>
  );
};
