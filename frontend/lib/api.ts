import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Axios instance configured for the Task Management API
 * Base URL points to the FastAPI backend
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Priority enum matching backend
 */
export type Priority = "High" | "Medium" | "Low";

/**
 * Task interface matching the backend API schema
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: Priority;
  category: string | null;
  due_date: string | null;
  is_recurring: boolean;
  user_id: number;
}

/**
 * Request interceptor to add JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (set by Better Auth or custom auth)
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API client methods for task operations
 */
export const taskApi = {
  /**
   * Get all tasks for the authenticated user
   * Supports search and priority filter
   */
  getTasks: async (params?: { search?: string; priority?: Priority }): Promise<Task[]> => {
    const response = await api.get<Task[]>("/api/todos", { params });
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (data: {
    title: string;
    description?: string;
    priority?: Priority;
    category?: string;
    due_date?: string;
    is_recurring?: boolean;
  }): Promise<Task> => {
    const response = await api.post<Task>("/api/todos", data);
    return response.data;
  },

  /**
   * Update a task
   */
  updateTask: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      is_completed?: boolean;
      priority?: Priority;
      category?: string;
      due_date?: string;
      is_recurring?: boolean;
    }
  ): Promise<Task> => {
    const response = await api.put<Task>(`/api/todos/${id}`, data);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/api/todos/${id}`);
  },
};
