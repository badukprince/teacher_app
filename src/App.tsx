import { Route, Routes } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import { AppDataProvider } from './store/AppDataContext';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { StudentListPage } from './pages/students/StudentListPage';
import { StudentDetailPage } from './pages/students/StudentDetailPage';
import { StudentFormPage } from './pages/students/StudentFormPage';
import { ClassListPage } from './pages/curriculum/ClassListPage';
import { TextbookLibraryPage } from './pages/curriculum/TextbookLibraryPage';
import { ClassCurriculumDetailPage } from './pages/curriculum/ClassCurriculumDetailPage';
import { EvaluationStudentListPage } from './pages/evaluations/EvaluationStudentListPage';
import { EvaluationHistoryPage } from './pages/evaluations/EvaluationHistoryPage';
import { EvaluationFormPage } from './pages/evaluations/EvaluationFormPage';
import { EvaluationDetailPage } from './pages/evaluations/EvaluationDetailPage';
import { AttendanceCheckPage } from './pages/attendance/AttendanceCheckPage';
import { AttendanceHistoryPage } from './pages/attendance/AttendanceHistoryPage';
import { NotificationSendListPage } from './pages/communication/NotificationSendListPage';
import { NotificationDetailPage } from './pages/communication/NotificationDetailPage';
import { ConsultationLogPage } from './pages/communication/ConsultationLogPage';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppDataProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="students" element={<StudentListPage />} />
          <Route path="students/new" element={<StudentFormPage />} />
          <Route path="students/:studentId" element={<StudentDetailPage />} />
          <Route path="students/:studentId/edit" element={<StudentFormPage />} />

          <Route path="curriculum" element={<ClassListPage />} />
          <Route path="curriculum/textbooks" element={<TextbookLibraryPage />} />
          <Route path="curriculum/classes/:classId" element={<ClassCurriculumDetailPage />} />
          <Route path="evaluations" element={<EvaluationStudentListPage />} />
          <Route path="evaluations/:studentId" element={<EvaluationHistoryPage />} />
          <Route path="evaluations/:studentId/new" element={<EvaluationFormPage />} />
          <Route path="evaluations/:studentId/:evaluationId" element={<EvaluationDetailPage />} />
          <Route path="evaluations/:studentId/:evaluationId/edit" element={<EvaluationFormPage />} />
          <Route path="attendance" element={<AttendanceCheckPage />} />
          <Route path="attendance/history" element={<AttendanceHistoryPage />} />
          <Route path="communication" element={<NotificationSendListPage />} />
          <Route path="communication/notify/:studentId" element={<NotificationDetailPage />} />
          <Route path="communication/consultations" element={<ConsultationLogPage />} />
          <Route path="resources" element={<PlaceholderPage title="자료실" />} />
          <Route path="settings" element={<PlaceholderPage title="마이페이지/설정" />} />

          <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없어요" />} />
        </Route>
      </Routes>
    </AppDataProvider>
  );
}

export default App;
