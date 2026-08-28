import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Landing from "./pages/Landing";
import Resources from "./pages/Resources";
import ApplicationEntry from "./pages/ApplicationEntry";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ApplicationFlow from "./pages/ApplicationFlow";
import Help from "./pages/Help";
import GuidedApplication from "./pages/GuidedApplication";
import { ApiError, type Application, type User, getCurrentApplication, getCurrentUser, logout } from "./api/client";

type Page = "landing" | "resources" | "entry" | "signin" | "dashboard" | "apply" | "help" | "guided";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [loggedIn, setLoggedIn] = useState(false);
  const [navData, setNavData] = useState<unknown>(null);
  const [user, setUser] = useState<User | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
        setLoggedIn(true);
        try {
          const { application } = await getCurrentApplication();
          setApplication(application);
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 404) throw error;
          setApplication(null);
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) console.error(error);
      } finally { setRestoring(false); }
    };
    void restoreSession();
  }, []);

  const navigate = (p: string, data?: unknown) => {
    if (data !== undefined) setNavData(data);
    else if (p !== "apply" && p !== "guided") setNavData(null);
    let next = p as Page;
    if ((next === "dashboard" || next === "apply" || next === "guided") && !application) next = "entry";
    if (next === "entry" && loggedIn && application && data === undefined) next = "dashboard";
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthenticated = (nextUser: User, nextApplication: Application | null) => {
    setUser(nextUser); setApplication(nextApplication); setLoggedIn(true); setPage(nextApplication ? "dashboard" : "entry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleLogout = async () => {
    try { await logout(); } catch (error) { console.error(error); }
    finally { setLoggedIn(false); setUser(null); setApplication(null); setNavData(null); setPage("landing"); }
  };

  const startApplication = () => {
    if (loggedIn && application) navigate("dashboard");
    else navigate("entry");
  };

  const bare = page === "signin";
  const applyFocus = typeof navData === "object" && navData !== null && "focus" in navData ? String((navData as { focus?: string }).focus || "") : "";

  if (restoring) return <div className="min-h-screen bg-white flex items-center justify-center text-sm text-gray-500">Restoring your journey…</div>;

  return (
    <div className="min-h-full flex flex-col">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {!bare && <Nav loggedIn={loggedIn} onNavigate={navigate} currentPage={page} onLogout={handleLogout} onStart={startApplication} />}

      <main id="main-content" tabIndex={-1}>
        {page === "landing" && <Landing onNavigate={navigate} onStart={startApplication} />}
        {page === "resources" && <Resources onNavigate={navigate} onStart={startApplication} />}
        {page === "entry" && <ApplicationEntry onNavigate={navigate} loggedIn={loggedIn} application={application} onApplication={setApplication} />}
        {page === "signin" && <SignIn onNavigate={navigate} navData={navData} onAuthenticated={handleAuthenticated} />}
        {page === "dashboard" && application ? <Dashboard onNavigate={navigate} user={user} application={application} /> : null}
        {page === "apply" && application ? <ApplicationFlow application={application} onUpdated={setApplication} onNavigate={navigate} focus={applyFocus} /> : null}
        {page === "guided" && application ? <GuidedApplication application={application} onUpdated={setApplication} onNavigate={navigate} /> : null}
        {page === "help" && <Help onNavigate={navigate} application={application} />}
        {(page === "dashboard" || page === "apply" || page === "guided") && !application && (
          <ApplicationEntry onNavigate={navigate} loggedIn={loggedIn} application={application} onApplication={setApplication} />
        )}
      </main>
    </div>
  );
}
