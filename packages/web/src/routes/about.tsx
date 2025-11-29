import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <h1>About</h1>
        <p>Learn more about this starter template.</p>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Stack</h2>
          <p>
            This template uses React 19, TanStack Router for routing, TanStack Query for data
            fetching, and Vite for blazing fast development.
          </p>
        </div>
        <div className="card">
          <h2>Type Safety</h2>
          <p>
            Full TypeScript support throughout the entire stack, from routes to API calls and
            everything in between.
          </p>
        </div>
        <div className="card">
          <h2>Developer Experience</h2>
          <p>Hot module replacement, instant server start, and optimized production builds out of the box.</p>
        </div>
      </div>
    </div>
  );
}

