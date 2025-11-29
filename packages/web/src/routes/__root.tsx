import type { QueryClient } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { useSession } from "../lib/api";

interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { data: session, isPending } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="app-layout">
      <nav className="nav">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Anchor
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link" activeProps={{ className: "nav-link active" }}>
              Home
            </Link>
            <Link to="/about" className="nav-link" activeProps={{ className: "nav-link active" }}>
              About
            </Link>
            <Link to="/data" className="nav-link" activeProps={{ className: "nav-link active" }}>
              Data
            </Link>
            {isPending ? null : isLoggedIn ? (
              <Link to="/account" className="nav-link" activeProps={{ className: "nav-link active" }}>
                Account
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link" activeProps={{ className: "nav-link active" }}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
