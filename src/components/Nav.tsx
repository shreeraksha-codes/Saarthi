interface NavProps {
  loggedIn?: boolean;
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export default function Nav({ loggedIn, onNavigate, currentPage }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate("landing")}
          className="font-serif text-xl text-teal-600 tracking-tight hover:text-teal-700 transition-colors"
        >
          Sarathi
        </button>

        <div className="flex items-center gap-1">
          {loggedIn ? (
            <>
              <NavLink active={currentPage === "dashboard"} onClick={() => onNavigate("dashboard")}>
                My Journey
              </NavLink>
              <NavLink active={currentPage === "resources"} onClick={() => onNavigate("resources")}>
                Resources
              </NavLink>
              <button
                onClick={() => onNavigate("landing")}
                className="ml-2 w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-medium flex items-center justify-center hover:bg-teal-700 transition-colors"
              >
                P
              </button>
            </>
          ) : (
            <>
              <NavLink active={currentPage === "resources"} onClick={() => onNavigate("resources")}>
                Resources
              </NavLink>
              <NavLink onClick={() => onNavigate("signin")}>Login</NavLink>
              <button
                onClick={() => onNavigate("entry")}
                className="ml-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 active:bg-teal-800 transition-colors"
              >
                Apply for a Licence
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        active
          ? "text-teal-700 bg-teal-50 font-medium"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
