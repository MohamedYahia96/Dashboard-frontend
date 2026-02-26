import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './hooks/useUtils';
import { ProtectedRoute, AdminRoute } from './guards/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Entertainment, SocialMedia, AiTools, Academic, CalendarPage } from './pages/Sections';
import CoursesHub from './pages/CoursesHub';
import CourseTrackPage from './pages/CourseTrackPage';
import MusicPage from './pages/MusicPage';
import StudySessions from './pages/StudySessions';
import StickyNotes from './pages/StickyNotes';
import { StudySessionProvider } from './contexts/StudySessionContext';
import AdminPanel from './pages/AdminPanel';
import ProfileSettings from './pages/ProfileSettings';
import ReportsPage from './pages/ReportsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import NotAuthorized from './pages/NotAuthorized';
import './i18n';
import './styles/index.css';
import './styles/themes.css';
import './styles/rtl.css';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <StudySessionProvider>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected */}
                <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />

                  {/* 8 Sections */}
                  <Route path="courses" element={<CoursesHub />} />
                  <Route path="courses/:trackId" element={<CourseTrackPage />} />
                  <Route path="entertainment" element={<Entertainment />} />
                  <Route path="study-sessions" element={<StudySessions />} />
                  <Route path="social-media" element={<SocialMedia />} />
                  <Route path="music" element={<MusicPage />} />
                  <Route path="ai-tools" element={<AiTools />} />
                  <Route path="academic" element={<Academic />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="sticky-notes" element={<StickyNotes />} />

                  {/* Utility Pages */}
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="activity-log" element={<ActivityLogPage />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="not-authorized" element={<NotAuthorized />} />

                  {/* Admin Only */}
                  <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </StudySessionProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
