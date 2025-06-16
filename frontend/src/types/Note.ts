export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  tags?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
}