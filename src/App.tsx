import { useState } from "react";
import Nav from "./components/Nav";
import Landing from "./pages/Landing";
import Resources from "./pages/Resources";
import ApplicationEntry from "./pages/ApplicationEntry";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ApplicationFlow from "./pages/ApplicationFlow";
import Help from "./pages/Help";

type Page = "landing" | "resources" | "entry" | "signin" | "dashboard" | "apply" | "help";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [loggedIn, setLoggedIn] = useState(false);
  const [navData, setNavData] = useState<unknown>(null);

  const navigate = (p: string, data?: unknown) => {
    if (data !== undefined) setNavData(data);
    if (p === "dashboard" || p === "apply") setLoggedIn(true);
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pages without the Nav shell
  const bare = page === "signin";

  return (
    <div className="min-h-full flex flex-col">
      {!bare && <Nav loggedIn={loggedIn} onNavigate={navigate} currentPage={page} />}

      {page === "landing" && <Landing onNavigate={navigate} />}
      {page === "resources" && <Resources onNavigate={navigate} />}
      {page === "entry" && <ApplicationEntry onNavigate={navigate} />}
      {page === "signin" && <SignIn onNavigate={navigate} navData={navData} />}
      {page === "dashboard" && <Dashboard onNavigate={navigate} />}
      {page === "apply" && <ApplicationFlow onNavigate={navigate} />}
      {page === "help" && <Help onNavigate={navigate} />}
    </div>
  );
}
