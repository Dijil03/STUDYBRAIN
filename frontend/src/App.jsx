import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ThemeWrapper from "./components/ThemeWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import SEOProvider from "./components/SEOProvider";
import JoinViaInvite from "./pages/JoinViaInvite";

// Lazy load all pages for better performance
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Homework = lazy(() => import("./pages/Homework"));
const WeekPlan = lazy(() => import("./pages/WeekPlan"));
const Motivation = lazy(() => import("./pages/Motivation"));
const MyWorld = lazy(() => import("./pages/MyWorld"));
const StudyTime = lazy(() => import("./pages/StudyTime"));
const StudyTimer = lazy(() => import("./pages/StudyTimer"));
const Note = lazy(() => import("./pages/Note"));
const Community = lazy(() => import("./pages/Community"));
const Goals = lazy(() => import("./pages/Goals"));
const WeeklyHomeworkLog = lazy(() => import("./pages/WeeklyHomeworkLog"));
const ExamTime = lazy(() => import("./pages/ExamTime"));
const Flashcard = lazy(() => import("./pages/Flashcard"));
const FlashcardGenerator = lazy(() => import("./pages/FlashcardGenerator"));
const FlashcardViewer = lazy(() => import("./pages/FlashcardViewer"));
const Badges = lazy(() => import("./pages/Badges"));
const Assessments = lazy(() => import("./pages/Assessments"));
const StudyJournal = lazy(() => import("./pages/StudyJournal"));
const FolderManager = lazy(() => import("./pages/FolderManager"));
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Subscription = lazy(() => import("./pages/Subscription"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const GoogleClassroom = lazy(() => import("./pages/GoogleClassroom"));
const StripeSetup = lazy(() => import("./pages/StripeSetup"));
const StripePricing = lazy(() => import("./pages/StripePricing"));
const PaymentForm = lazy(() => import("./pages/PaymentForm"));
const TestSubscription = lazy(() => import("./pages/TestSubscription"));
const Documents = lazy(() => import("./pages/Documents"));
const CancellationSuccess = lazy(() => import("./pages/CancellationSuccess"));
const LoadingDemo = lazy(() => import("./pages/LoadingDemo"));
const AI = lazy(() => import("./pages/AI"));
const AITutorPage = lazy(() => import("./pages/AITutorPage"));
const Calendar = lazy(() => import("./pages/Calendar"));
const RevisionScheduler = lazy(() => import("./pages/RevisionScheduler"));
const ConceptMastery = lazy(() => import("./pages/ConceptMastery"));
const FocusGarden = lazy(() => import("./pages/FocusGarden"));

const App = () => {
  return (
    <SEOProvider>
      <ErrorBoundary>
        <ThemeWrapper>
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
            <Route path="/" element={<Welcome />} />
            
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/week-plan" element={<WeekPlan />} />
            <Route path="/study-time" element={<StudyTime />} />
            <Route path="/study-timer" element={<StudyTimer />} />
            <Route path="/motivation" element={<Motivation />} />
            <Route path="/myworld" element={<MyWorld />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/note" element={<Note />} />
            <Route path="/community" element={<Community />} />
            <Route path="/weekly-homework-log" element={<WeeklyHomeworkLog />} />
            <Route path="/exam-time" element={<ExamTime />} />
            <Route path="/flashcard" element={<Flashcard />} />
            <Route path="/flashcards" element={<FlashcardGenerator />} />
            <Route path="/flashcard-viewer" element={<FlashcardViewer />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/study-journal" element={<StudyJournal />} />
            <Route path="/folder-manager" element={<FolderManager />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/document-editor" element={<DocumentEditor />} />
            <Route path="/document-editor/:documentId" element={<DocumentEditor />} />
            <Route path="/google-classroom" element={<GoogleClassroom />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/stripe-setup" element={<StripeSetup />} />
            <Route path="/stripe-pricing" element={<StripePricing />} />
            <Route path="/payment-form" element={<PaymentForm />} />
            <Route path="/test-subscription" element={<TestSubscription />} />
            <Route path="/cancellation-success" element={<CancellationSuccess />} />
            <Route path="/loading-demo" element={<LoadingDemo />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/revisions" element={<RevisionScheduler />} />
            <Route path="/concept-map" element={<ConceptMastery />} />
            <Route path="/focus-garden" element={<FocusGarden />} />
            <Route path="/study-groups" element={<JoinViaInvite />} />
            </Routes>
            </Suspense>
        </ThemeWrapper>
      </ErrorBoundary>
    </SEOProvider>
  );
};

export default App;