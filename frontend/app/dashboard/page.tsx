"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  ListTodo,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { taskApi, Task, Priority } from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import Navbar from "@/components/Navbar";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTasks();
  }, [router]);

  // Filter tasks based on search and priority
  useEffect(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
      setError("");
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const newTask = await taskApi.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category: category.trim() || undefined,
        due_date: dueDate || undefined,
      });
      setTasks([newTask, ...tasks]);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setCategory("");
      setDueDate("");
      setError("");
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await taskApi.updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      setError("");
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error(err);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editedTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      const updatedTask = await taskApi.updateTask(taskId, {
        title: editedTitle.trim(),
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      setEditingTaskId(null);
      setEditedTitle("");
      setError("");
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTitle("");
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <div className="space-y-8 pt-20 p-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-400" />
              Dashboard
            </h1>
            <p className="mt-2" style={{ color: 'var(--foreground-muted)' }}>
              Welcome back! Here's your task overview.
            </p>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="badge-danger px-4 py-3 rounded-xl text-sm flex items-center justify-between"
            >
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="hover:opacity-80 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Total Tasks Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card-solid p-6 card-elevated transition-all duration-300 hover:shadow-blue-500/10 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  Total Tasks
                </p>
                <motion.p
                  key={totalTasks}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mt-2"
                >
                  {totalTasks}
                </motion.p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <ListTodo className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>All your tasks</span>
            </div>
          </motion.div>

          {/* Completed Tasks Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card-solid p-6 card-elevated transition-all duration-300 hover:shadow-emerald-500/10 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Completed</p>
                <motion.p
                  key={completedTasks}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mt-2"
                >
                  {completedTasks}
                </motion.p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              <span className="font-semibold text-emerald-400">
                {completionRate}%
              </span>{" "}
              completion rate
            </div>
          </motion.div>

          {/* Pending Tasks Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card-solid p-6 card-elevated transition-all duration-300 hover:shadow-amber-500/10 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Pending</p>
                <motion.p
                  key={pendingTasks}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mt-2"
                >
                  {pendingTasks}
                </motion.p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Tasks in progress
            </div>
          </motion.div>
        </motion.div>

        {/* Create Task Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            Create New Task
          </h2>
          <form onSubmit={handleCreateTask} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  maxLength={500}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-dark w-full"
                  placeholder="Enter task title (max 500 characters)"
                />
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="select-dark w-full"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  maxLength={100}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-dark w-full"
                  placeholder="e.g., Work, Personal"
                />
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Due Date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-dark w-full"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-dark w-full"
                  placeholder="Enter task description (optional)"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={submitting || !title.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl",
                "text-base font-semibold text-white",
                "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
                "shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-300"
              )}
            >
              <Plus className="h-5 w-5" />
              {submitting ? "Adding..." : "Add Task"}
            </motion.button>
          </form>
        </motion.div>

        {/* Task List with Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Your Tasks {!loading && <span className="text-blue-400">({filteredTasks.length})</span>}
            </h2>

            {/* Priority Filter Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="btn-secondary flex items-center gap-2 py-2"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {priorityFilter === "All" ? "All Priorities" : priorityFilter}
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showFilterDropdown && "rotate-180")} />
              </motion.button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 glass-card-solid overflow-hidden z-10"
                  >
                    {(["All", "High", "Medium", "Low"] as const).map(
                      (filterOption) => (
                        <button
                          key={filterOption}
                          onClick={() => {
                            setPriorityFilter(filterOption);
                            setShowFilterDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm transition-all duration-200",
                            priorityFilter === filterOption
                              ? "bg-blue-600 text-white font-semibold"
                              : "text-slate-300 hover:bg-slate-700/50"
                          )}
                        >
                          {filterOption === "All"
                            ? "All Priorities"
                            : filterOption}
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-card-solid flex items-center justify-center">
                <ListTodo className="w-8 h-8" style={{ color: 'var(--input-placeholder)' }} />
              </div>
              <p style={{ color: 'var(--foreground-muted)' }}>
                {searchQuery || priorityFilter !== "All"
                  ? "No tasks match your filters."
                  : "No tasks yet. Create your first task above!"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onStartEdit={handleStartEdit}
                    editingTaskId={editingTaskId}
                    editedTitle={editedTitle}
                    onEditedTitleChange={setEditedTitle}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
