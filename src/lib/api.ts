import axios from 'axios';
import { getTelegramInitData } from './telegram';

// Замените на URL вашего backend (после запуска Cloudflare Tunnel)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://c931a52e12a04a3b786a4b97744c883e.serveo.net';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем Telegram initData в каждый запрос
api.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

export interface User {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  instructor_id?: number;
}

export interface Slot {
  id: number;
  instructor: number;
  instructor_name?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  student?: number;
  student_name?: string;
  status?: string;
}

export interface Booking {
  id: number;
  slot: Slot;
  student: number;
  status: 'active' | 'completed' | 'canceled';
  created_at: string;
}

export interface Review {
  id: number;
  booking: number;
  rating: number;
  comment: string;
  duration: 'short' | 'long';
  created_at: string;
}

export interface StudentStats {
  total_hours: number;
  completed_lessons: number;
  total_lessons: number;
  additional_lessons: number;
  progress_percentage: number;
}

export const authAPI = {
  login: () => api.post<User>('/auth/login/'),
  getMe: () => api.get<User>('/auth/me/'),
};

export const slotsAPI = {
  getAll: (params?: { instructor?: number; date?: string }) => 
    api.get<Slot[]>('/slots/', { params }),
  create: (data: { start_time: string; end_time: string }) => 
    api.post<Slot>('/slots/', data),
  delete: (id: number) => api.delete(`/slots/${id}/`),
  bulkCreate: (data: { 
    start_date: string; 
    end_date: string; 
    time_slots: { start: string; end: string }[];
    days: number[];
  }) => api.post<Slot[]>('/slots/bulk-create/', data),
};

export const bookingsAPI = {
  getStudentSchedule: () => api.get<Booking[]>('/bookings/my-schedule/'),
  book: (slotId: number) => api.post('/bookings/book/', { slot_id: slotId }),
  cancel: (bookingId: number) => api.post(`/bookings/${bookingId}/cancel/`),
};

export const studentsAPI = {
  getStats: () => api.get<StudentStats>('/students/stats/'),
  getInstructors: () => api.get<User[]>('/students/instructors/'),
};

export const reviewsAPI = {
  create: (data: {
    booking_id: number;
    rating: number;
    comment: string;
    duration: 'short' | 'long';
  }) => api.post<Review>('/reviews/', data),
};

export const instructorAPI = {
  getStudents: () => api.get<User[]>('/instructor/students/'),
  getSchedule: () => api.get<Booking[]>('/instructor/schedule/'),
  updateStudentStats: (studentId: number, data: {
    completed_hours?: number;
    additional_lessons?: number;
  }) => api.patch(`/instructor/students/${studentId}/stats/`, data),
};

export default api;