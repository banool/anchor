import type { QueryClient } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
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

