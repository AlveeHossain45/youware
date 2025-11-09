

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStaff from './pages/admin/ManageStaff'; // <-- 1. Import the new page
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import NoticeBoard from './pages/admin/NoticeBoard';
import AcademicStructure from './pages/admin/AcademicStructure';
import SystemSettings from './pages/admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateExam from './pages/teacher/CreateExam';
import MarkAttendance from './pages/teacher/MarkAttendance';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import OnlineExam from './pages/student/OnlineExam';
import Attendance from './pages/student/Attendance';
import StudentFinancePage from './pages/student/Finance'; // New import for student finance

// Accountant Pages
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import Payments from './pages/accountant/Payments';

// Shared Pages
import Profile from './pages/shared/Profile';
import Settings from './pages/shared/Settings';
import ClassesList from './pages/shared/Classes';
import ExamsList from './pages/shared/Exams';
import Assignments from './pages/shared/Assignments';
import Messages from './pages/shared/Messages';
import Reports from './pages/shared/Reports';
import Invoices from './pages/shared/Invoices';
import Finance from './pages/shared/Finance';
import OnlineClasses from './pages/shared/OnlineClasses';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><ManageStaff /></ProtectedRoute>} /> 
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><ManageTeachers /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/noticeboard" element={<ProtectedRoute allowedRoles={['admin']}><NoticeBoard /></ProtectedRoute>} />
      <Route path="/admin/academic-structure" element={<ProtectedRoute allowedRoles={['admin']}><AcademicStructure /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ClassesList /></ProtectedRoute>} />
      <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><ExamsList /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><Finance /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemSettings /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><Profile /></ProtectedRoute>} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><ClassesList /></ProtectedRoute>} />
      <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={['teacher']}><CreateExam /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><Assignments /></ProtectedRoute>} />
      <Route path="/teacher/mark-attendance" element={<ProtectedRoute allowedRoles={['teacher']}><MarkAttendance /></ProtectedRoute>} />
      <Route path="/teacher/noticeboard" element={<ProtectedRoute allowedRoles={['teacher']}><NoticeBoard /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['teacher']}><Profile /></ProtectedRoute>} />
      <Route path="/teacher/settings" element={<ProtectedRoute allowedRoles={['teacher']}><Settings /></ProtectedRoute>} />
      <Route path="/teacher/online-classes" element={<ProtectedRoute allowedRoles={['teacher']}><OnlineClasses /></ProtectedRoute>} />
      <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={['teacher']}><Messages /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/noticeboard" element={<ProtectedRoute allowedRoles={['student']}><NoticeBoard /></ProtectedRoute>} />
      <Route path="/student/finance" element={<ProtectedRoute allowedRoles={['student']}><StudentFinancePage /></ProtectedRoute>} />
      <Route path="/student/exam/:id" element={<ProtectedRoute allowedRoles={['student']}><OnlineExam /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><Profile /></ProtectedRoute>} />
      <Route path="/student/classes" element={<ProtectedRoute allowedRoles={['student']}><ClassesList /></ProtectedRoute>} />
      <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><ExamsList /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><Assignments /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><Reports /></ProtectedRoute>} />
      <Route path="/student/online-classes" element={<ProtectedRoute allowedRoles={['student']}><OnlineClasses /></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute allowedRoles={['student']}><Messages /></ProtectedRoute>} />

      {/* Accountant Routes */}
      <Route path="/accountant/dashboard" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantDashboard /></ProtectedRoute>} />
      <Route path="/accountant/payments" element={<ProtectedRoute allowedRoles={['accountant']}><Payments /></ProtectedRoute>} />
      <Route path="/accountant/profile" element={<ProtectedRoute allowedRoles={['accountant']}><Profile /></ProtectedRoute>} />
      <Route path="/accountant/settings" element={<ProtectedRoute allowedRoles={['accountant']}><Settings /></ProtectedRoute>} />
      <Route path="/accountant/invoices" element={<ProtectedRoute allowedRoles={['accountant']}><Invoices /></ProtectedRoute>} />
      <Route path="/accountant/reports" element={<ProtectedRoute allowedRoles={['accountant']}><Reports /></ProtectedRoute>} />

      {/* Default Route */}
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Navigate to="/login" />} />

      {/* Catch-all Route for 404 */}
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900">
          <div className="p-8 text-center shadow-lg bg-white/50 dark:bg-black/20 backdrop-blur-lg rounded-2xl">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">404</h1>
            <p className="mb-8 text-gray-600 dark:text-gray-300">Page Not Found</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;