import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptors
api.interceptors.request.use((config) => {
  console.log('🚀 Making API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    data: config.data
  });
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.log('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Interfaces
export interface User {
  id: number;
  telegram_id?: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  instructor_id?: number;
}

export interface LoginResponse {
  user: User;
  token: string;
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

export interface StudentStats {
  total_hours: number;
  completed_lessons: number;
  total_lessons: number;
  additional_lessons: number;
  progress_percentage: number;
}

// API methods
export const authAPI = {
  login: (data: { phone: string; password: string; role: string }) => 
    api.post<LoginResponse>('/auth/login/', data),
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

export interface Review {
  id: number;
  booking: number;
  rating: number;
  comment: string;
  duration: 'short' | 'long';
  created_at: string;
}

export default api;