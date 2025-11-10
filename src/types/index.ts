export interface User {
  id: number;
  telegram_id?: number;
  first_name: string;
  last_name?: string;
  phone: string;
  role: 'student' | 'instructor' | 'admin';
  instructor_id?: number;
}

export interface LoginFormData {
  phone: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
}

export type Role = 'student' | 'instructor' | 'admin';