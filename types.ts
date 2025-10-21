export enum MochiState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  ALARM_RINGING = 'ALARM_RINGING',
  // FIX: Add missing state used in MochiDisplay.tsx
  ENTERING_DEEP_SLEEP = 'ENTERING_DEEP_SLEEP',
}

export enum IdleExpression {
  NORMAL,
  BLINK,
  LOOK_LEFT,
  LOOK_RIGHT,
  HAPPY,
  SAD,
  SURPRISED,
  SQUINT,
  WINK_LEFT,
  LOVE,
  DIZZY,
  ANGRY,
  CONFUSED,
  SLEEPY,
  PROUD,
  KAWAII,
}

export enum Subject {
  GENERAL = 'Trò chuyện chung',
  MATH = 'Toán',
  PHYSICS = 'Vật Lý',
  CHEMISTRY = 'Hóa Học',
  BIOLOGY = 'Sinh Học',
  LITERATURE = 'Ngữ Văn',
  HISTORY = 'Lịch Sử',
  GEOGRAPHY = 'Địa Lý',
  ENGLISH = 'Tiếng Anh',
  IT = 'Tin Học'
}

export interface UserProfile {
  name: string;
  gradeLevel: string;
  wakeWord?: string;
}

export interface ChatMessage {
  speaker: 'user' | 'mochi';
  text: string;
  isStreaming?: boolean;
}

export interface IPTVChannel {
  name:string;
  logo: string;
  url: string;
}