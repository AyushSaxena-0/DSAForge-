export interface Problem {
  id: number;
  topic: string;
  problem_name: string;
  leetcode_number: string;
  difficulty: string;
  direct_url: string;
  assignment_file: string;
  completed: boolean;
  revision_count: number;
  notes: string;
  date_solved: string | null;
  is_top_250: boolean;
}


export interface TopicProgress {
  topic: string;
  total: number;
  solved: number;
  percentage: number;
}

export interface DifficultyBreakdown {
  easy: number;
  easy_solved: number;
  medium: number;
  medium_solved: number;
  hard: number;
  hard_solved: number;
  na: number;
  na_solved: number;
}

export interface DashboardStats {
  total_questions: number;
  solved_questions: number;
  remaining_questions: number;
  completion_percentage: number;
  current_streak: number;
  longest_streak: number;
  topic_progress: TopicProgress[];
  difficulty_breakdown: DifficultyBreakdown;
  recent_activity: Problem[];
}
