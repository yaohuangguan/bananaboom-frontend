import React, { useState, useEffect, Suspense, lazy } from 'react';
import { io, Socket } from 'socket.io-client';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Hero } from './components/Hero';
import { CosmicBackground } from './components/CosmicBackground';
import { ScenicBackground } from './components/ScenicBackground';
import { ToastContainer, toast } from './components/Toast';
import { DeleteModal } from './components/DeleteModal';
import { apiService } from './services/api';
import { Theme, PageView, User, BlogPost, ChatUser, PERM_KEYS, can } from './types';
import { useTranslation } from './i18n/LanguageContext';
import { Helmet } from 'react-helmet-async';

// Component Imports
import { LoginModal } from './components/LoginModal';
import { ResumeView } from './components/ResumeView';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';
import { AccessRestricted } from './components/AccessRestricted';
import { InstallPwa } from './components/InstallPwa';

// Page Imports
import { BlogList } from './pages/BlogList';
import { ArticleView } from './pages/ArticleView';
import { PortfolioPage } from './pages/PortfolioPage';
import { UserProfile } from './pages/UserProfile';
import { SettingsPage } from './pages/SettingsPage';
import { ChatRoom } from './pages/ChatRoom';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { SystemManagement } from './pages/SystemManagement';
import { NotFound } from './pages/NotFound';
import { NoPermission } from './pages/NoPermission';
import { createLazyComponent } from './components/LazyLoader';

// Lazy Load Heavy Pages
const PrivateSpaceDashboard = createLazyComponent(
  () => import('./pages/private/PrivateSpaceDashboard')
);
const FootprintSpace = createLazyComponent(() => import('./pages/FootprintSpace'));

// Fix: Define standard lazy components properly
const JournalSpace = createLazyComponent(() => import('./pages/private/JournalSpace'));
const SecondBrainSpace = createLazyComponent(() => import('./pages/private/SecondBrainSpace'));

const SOCKET_URL = 'https://bananaboom-api-242273127238.asia-east1.run.app';

// Layout Wrapper Component
const Layout: React.FC<{
  user: User | null;
  socket: Socket | null;
  theme: Theme;
  toggleTheme: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onNavigateToChat: (user: ChatUser) => void;
}> = ({ user, socket, theme, toggleTheme, onLogin, onLogout, onNavigateToChat }) => {
  const location = useLocation();
  const isPrivateSpace = location.pathname.startsWith('/captain-cabin');
  const isArticleView = /^\/blogs\/.+/.test(location.pathname);

  // First Screen Dismissal Logic: Moved here to ensure layout is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('app-ready');
    }, 500); // 增加延迟确保主页内容渲染完成
    return () => clearTimeout(timer);
  }, []);

  let mainBgClass = '';
  if (isPrivateSpace) {
    mainBgClass = 'bg-gradient-to-br from-pink-200 via-rose-200 to-pink-200';
  } else if (isArticleView) {
    mainBgClass = theme === Theme.DARK ? 'bg-[#111]' : 'bg-white';
  } else {
    mainBgClass = theme === Theme.DARK ? 'bg-slate-950' : 'bg-transparent';
  }

  const getCurrentPageView = (path: string): PageView => {
    if (path.startsWith('/blogs')) return PageView.BLOG;
    if (path.startsWith('/profile')) return PageView.RESUME;
    if (path.startsWith('/user-profile')) return PageView.PROFILE;
    if (path.startsWith('/system-management')) return PageView.SYSTEM;
    if (path.startsWith('/system-settings')) return PageView.SETTINGS;
    if (path.startsWith('/footprints')) return PageView.FOOTPRINT;
    if (path.startsWith('/chatroom')) return PageView.CHAT;
    if (path.startsWith('/captain-cabin')) return PageView.PRIVATE_SPACE;
    return PageView.HOME;
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 selection:bg-primary-500/30 ${mainBgClass}`}
    >
      <Helmet titleTemplate="%s | Orion" defaultTitle="Orion | Engineering & Design">
        <meta
          name="description"
          content="A modern blog and portfolio built with Next.js architecture."
        />
      </Helmet>

      <ToastContainer />
      <InstallPwa />

      {!isPrivateSpace && !isArticleView && (
        <>{theme === Theme.DARK ? <CosmicBackground theme={theme} /> : <ScenicBackground />}</>
      )}

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        setPage={() => {}}
        currentPage={getCurrentPageView(location.pathname)}
        currentUser={user}
        onLogin={onLogin}
        onLogout={onLogout}
        socket={socket}
        onNavigateToChat={onNavigateToChat}
      />

      <main className="relative z-10 pointer-events-none w-full pb-24 md:pb-0">
        <div className="pointer-events-auto w-full min-h-screen">
          <Outlet />
        </div>
      </main>

      <Footer
        currentPage={getCurrentPageView(location.pathname)}
        currentUser={user}
        onLogin={onLogin}
      />

      <div className="block xl:hidden">
        <MobileBottomNav currentUser={user} onLoginRequest={onLogin} />
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{
  user: User | null;
  element: React.ReactNode;
  requiredPerm?: string;
}> = ({ user, element, requiredPerm }) => {
  if (!user) return <Navigate to="/" replace />;
  if (requiredPerm && !can(user, requiredPerm)) {
    return (
      <div className="pt-32 container mx-auto px-6">
        <AccessRestricted permission={requiredPerm} />
      </div>
    );
  }
  return <>{element}</>;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === Theme.DARK || savedTheme === Theme.LIGHT) return savedTheme as Theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatTarget, setChatTarget] = useState<ChatUser | null>(null);
  const [publicPostToDelete, setPublicPostToDelete] = useState<BlogPost | null>(null);

  const { t, language, toggleLanguage } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (e) {
          apiService.logout();
        }
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (theme === Theme.DARK) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(SOCKET_URL);
      // Fix: cast to any for custom events
      (newSocket as any).on('connect', () => {
        (newSocket as any).emit('USER_CONNECTED', {
          name: user.displayName,
          id: user._id,
          email: user.email,
          photoURL: user.photoURL
        });
      });
      setSocket(newSocket);
    } else if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  if (isAuthChecking) return <PageLoader />;

  return (
    <>
      <Routes>
        <Route
          element={
            <Layout
              user={user}
              socket={socket}
              theme={theme}
              toggleTheme={() => setTheme((p) => (p === Theme.LIGHT ? Theme.DARK : Theme.LIGHT))}
              onLogin={() => setIsLoginModalOpen(true)}
              onLogout={() => {
                apiService.logout();
                setUser(null);
                navigate('/');
              }}
              onNavigateToChat={(u) => {
                setChatTarget(u);
                navigate('/chatroom');
              }}
            />
          }
        >
          <Route
            path="/"
            element={
              <>
                <Hero
                  onCtaClick={() => navigate('/blogs')}
                  onSecondaryCtaClick={() => navigate('/profile')}
                />
                <div id="console" className="pointer-events-auto">
                  <ResumeView
                    onNavigate={(p) =>
                      navigate(
                        p === PageView.BLOG
                          ? '/blogs'
                          : p === PageView.RESUME
                            ? '/profile'
                            : p === PageView.CHAT
                              ? '/chatroom'
                              : '/user-profile'
                      )
                    }
                    currentUser={user}
                    onLoginRequest={() => setIsLoginModalOpen(true)}
                  />
                </div>
              </>
            }
          />
          <Route
            path="/blogs"
            element={
              <BlogList
                onSelectBlog={(b) => navigate(`/blogs/${b._id}`)}
                currentUser={user}
                onDeletePost={(b) => setPublicPostToDelete(b)}
              />
            }
          />
          <Route
            path="/blogs/:slug"
            element={
              <ArticleView
                onBack={() => navigate('/blogs')}
                onNavigateToBlog={(b) => navigate(`/blogs/${b._id}`)}
                currentUser={user}
                onLoginRequest={() => setIsLoginModalOpen(true)}
              />
            }
          />
          <Route path="/profile" element={<PortfolioPage currentUser={user} />} />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute
                user={user}
                element={<UserProfile user={user!} onUpdateUser={setUser} />}
              />
            }
          />
          <Route
            path="/system-management"
            element={
              <ProtectedRoute
                user={user}
                element={<SystemManagement />}
                requiredPerm={PERM_KEYS.SYSTEM_ACCESS}
              />
            }
          />
          <Route
            path="/system-settings"
            element={
              <SettingsPage
                theme={theme}
                toggleTheme={() => setTheme((p) => (p === Theme.LIGHT ? Theme.DARK : Theme.LIGHT))}
                language={language}
                toggleLanguage={toggleLanguage}
              />
            }
          />
          <Route
            path="/audit-log"
            element={
              <ProtectedRoute
                user={user}
                element={<AuditLogViewer />}
                requiredPerm={PERM_KEYS.SYSTEM_LOGS}
              />
            }
          />
          <Route
            path="/footprints"
            element={
              <ProtectedRoute
                user={user}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <FootprintSpace theme={theme} />
                  </Suspense>
                }
                requiredPerm={PERM_KEYS.FOOTPRINT_USE}
              />
            }
          />
          <Route
            path="/chatroom"
            element={
              <ProtectedRoute
                user={user}
                element={<ChatRoom currentUser={user!} socket={socket} targetUser={chatTarget} />}
              />
            }
          />
          <Route
            path="/captain-cabin"
            element={
              <ProtectedRoute
                user={user}
                requiredPerm={PERM_KEYS.PRIVATE_ACCESS}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PrivateSpaceDashboard user={user} />
                  </Suspense>
                }
              />
            }
          >
            <Route index element={<Navigate to="journal-space" replace />} />
            {/* Fix: Using properly defined lazy components */}
            <Route path="journal-space" element={<JournalSpace />} />
            <Route path="ai-space" element={<SecondBrainSpace user={user} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <DeleteModal
        isOpen={!!publicPostToDelete}
        onClose={() => setPublicPostToDelete(null)}
        onConfirm={async () => {
          if (publicPostToDelete) {
            await apiService.deletePost(publicPostToDelete._id);
            setPublicPostToDelete(null);
            window.dispatchEvent(new Event('blog:refresh'));
          }
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={setUser}
      />
    </>
  );
};

export default App;
