import { useQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const dataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/data",
  component: DataPage,
});

interface Post {
  id: number;
  title: string;
  body: string;
}

function DataPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
  });

  return (
    <div>
      <div className="page-header">
        <h1>Data Fetching</h1>
        <p>Demonstrating TanStack Query with real API data.</p>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner" />
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <h2>Error</h2>
          <p>{error.message}</p>
        </div>
      )}

      {data && (
        <div className="grid">
          {data.map((post) => (
            <div key={post.id} className="card data-card">
              <h2>{post.title.slice(0, 40)}...</h2>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

