import { Link, createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function HomePage() {
  return (
    <div className="hero">
      <h1>
        Hello, <span className="hero-highlight">World</span>
      </h1>
      <p>
        A modern React app powered by TanStack Router for type-safe navigation and TanStack Query
        for powerful data fetching.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/data" className="btn btn-primary">
          Fetch Data →
        </Link>
        <Link to="/about" className="btn btn-secondary">
          Learn More
        </Link>
      </div>

      <div className="grid">
        <div className="card">
          <h2>⚡ TanStack Router</h2>
          <p>Type-safe routing with first-class search params, loaders, and layouts.</p>
        </div>
        <div className="card">
          <h2>🔄 TanStack Query</h2>
          <p>Powerful data synchronization with caching, background updates, and more.</p>
        </div>
        <div className="card">
          <h2>🚀 Vite</h2>
          <p>Lightning fast HMR and optimized builds for the best developer experience.</p>
        </div>
      </div>
    </div>
  );
}

