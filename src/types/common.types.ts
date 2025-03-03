export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
} 