export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}