

export interface BlogPost {
  _id: string;
  name: string;
  info: string;
  author: string;
  tags: string[];
  createdDate?: string;
  date?: string;
  likes: number;
  image: string;
  content?: string;
  isPrivate?: boolean;
  iframeUrl?: string;
  code?: string;
  code2?: string;
  codeGroup?: string;
  user?: User;
}

export interface Photo {
  _id: string;
  url: string;
  name?: string;      // Backend field
  caption?: string;   // Legacy support
  createdDate?: string; // Backend field
  date?: string;      // Legacy support
  location?: string;
  order?: number;
}

export interface User {
  _id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  token?: string;
  vip?: boolean;
  private_token?: string;
  date?: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  target: string;
  targetId?: string;
  operator?: User;
  details?: any;
  createdDate: string;
  ipAddress?: string;
  status?: string;
  message?: string; // From socket event
}

export interface Project {
  _id: string;
  name: string;
  info: string;
  link: string;
  image: string;
  likes?: number;
}

// New Portfolio Project Model
export interface PortfolioProject {
  _id: string;
  title_zh: string;
  title_en: string;
  summary_zh?: string;
  summary_en?: string;
  description_zh?: string;
  description_en?: string;
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
}

export interface ResumeItem {
  _id: string;
  title: string;
  _title?: string;
  info: string;
  _info?: string;
  degree?: string;
  url?: string;
}

// New Resume Model
export interface ResumeData {
  _id: string;
  basics: {
    name_zh?: string;
    name_en?: string;
    label_zh?: string;
    label_en?: string;
    email?: string;
    phone?: string;
    location_zh?: string;
    location_en?: string;
    summary_zh?: string;
    summary_en?: string;
  };
  education: Array<{
    institution?: string;
    location?: string;
    area_zh?: string;
    area_en?: string;
    studyType_zh?: string;
    studyType_en?: string;
    startDate?: string;
    endDate?: string;
    score_zh?: string;
    score_en?: string;
  }>;
  work: Array<{
    company_zh?: string;
    company_en?: string;
    position_zh?: string;
    position_en?: string;
    startDate?: string;
    endDate?: string;
    highlights_zh?: string[];
    highlights_en?: string[];
  }>;
  skills: Array<{
    name_zh?: string;
    name_en?: string;
    keywords: string[];
  }>;
  languages: Array<{
    language_zh?: string;
    language_en?: string;
    fluency_zh?: string;
    fluency_en?: string;
  }>;
}

export interface Log {
  _id: string;
  version: string;
  date: string;
  content: string;
}

export interface Reply {
  id: string;
  user: User;
  content: string;
  date: string;
  photoURL?: string;
  targetUser?: User;
}

export interface Comment {
  _id: string;
  id: string;
  user: User;
  comment: string;
  date: string;
  photoURL?: string;
  reply: Reply[];
  _postid: string;
  _userid?: string;
}

// Updated Bucket List / Todo Model
export interface Todo {
  _id: string;
  todo: string; // The Title
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  images?: string[];
  targetDate?: string;
  order?: number;
  done: boolean; // Legacy field for compatibility
  timestamp: number | string;
  create_date?: string;
  complete_date?: string;
}

// Period / Cycle Types
export interface PeriodRecord {
  _id?: string;
  startDate: string; // ISO Date String
  endDate?: string;  // ISO Date String
  duration?: number;
  cycleLength?: number;
  symptoms?: string[];
  flow?: 'light' | 'medium' | 'heavy';
  note?: string;
  operator?: string; // ID of the user who logged this record
}

export interface PeriodResponse {
  records: PeriodRecord[];
  avgCycle: number;
  avgDuration: number;
  lastStart: string;
  prediction: {
    nextPeriodStart: string;
    ovulationDate: string;
    fertileWindow: {
      start: string;
      end: string;
    };
    desc: string;
  };
}

// Fitness Types (Refactored)
export interface FitnessBody {
  weight?: number; // kg
}

export interface FitnessWorkout {
  isDone: boolean;
  duration?: number; // min
  types?: string[]; // Array of strings e.g. ["Running", "Chest"]
  note?: string;
}

export interface FitnessDiet {
  content?: string; // "Bread for breakfast..."
  water?: number; // ml or cups
}

export interface FitnessStatus {
  mood?: 'happy' | 'neutral' | 'bad';
  sleepHours?: number;
}

export interface FitnessRecord {
  _id?: string;
  user?: User | string; // Can be ID or populated object
  date?: string; 
  dateStr?: string; // YYYY-MM-DD
  body?: FitnessBody;
  workout?: FitnessWorkout;
  diet?: FitnessDiet; // Changed from nutrition
  status?: FitnessStatus; // New field
  photos?: string[];
  targetUserEmail?: string; // For submission only
}

export interface FitnessStats {
  dates: string[];
  weights: (number | null)[];
  durations: number[];
  water: (number | null)[];
  sleep: (number | null)[];
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export type Language = 'en' | 'zh';

export enum PageView {
  HOME = 'HOME',
  BLOG = 'BLOG',
  ARTICLE = 'ARTICLE',
  RESUME = 'RESUME', // Now maps to PortfolioPage
  PRIVATE_SPACE = 'PRIVATE_SPACE',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT',
  AUDIT_LOG = 'AUDIT_LOG',
  ARCHIVES = 'ARCHIVES' // Deprecated, but keeping enum to avoid breaks if any
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}

// Chat Types
export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  socketId?: string;
}

export interface ChatMessage {
  message: string;
  author: string;
  userId?: string;
  email?: string;
  photoURL?: string;
  room?: string;
  timestamp?: string;
  isPrivate?: boolean;
  isSystem?: boolean;
  receiver?: string;
}
