import { createRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { rootRoute } from "./__root";
import { api, signOut, useSession } from "../lib/api";

export const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionLoading } = useSession();

  // Fetch user details from /user endpoint using Eden.
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await api.user.get();
      if (error) {
        throw new Error(typeof error.value === "string" ? error.value : "Failed to fetch user");
      }
      return data;
    },
    enabled: !!session?.user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (sessionLoading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Not signed in</h1>
            <p>Please sign in to view your account.</p>
          </div>
          <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
            <a href="/login" className="btn btn-primary btn-full">
              Sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="page-header">
        <h1>Account</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="account-grid">
        <div className="card account-card">
          <div className="account-avatar">
            {userData?.image ? (
              <img src={userData.image} alt={userData.name} />
            ) : (
              <div className="avatar-placeholder">{session.user.name?.charAt(0) ?? "U"}</div>
            )}
          </div>

          <div className="account-info">
            <h2>{session.user.name}</h2>
            <p className="account-email">{session.user.email}</p>
          </div>

          {userLoading && (
            <div className="account-loading">
              <div className="spinner" style={{ width: 24, height: 24 }} />
              <span>Loading user details...</span>
            </div>
          )}

          {userError && (
            <div className="auth-error" style={{ marginTop: "1rem" }}>
              {userError.message}
            </div>
          )}

          {userData && (
            <div className="account-details">
              <h3>User Details from API</h3>
              <dl>
                <dt>ID</dt>
                <dd>{userData.id}</dd>
                <dt>Name</dt>
                <dd>{userData.name}</dd>
                <dt>Email</dt>
                <dd>{userData.email}</dd>
                <dt>Email Verified</dt>
                <dd>{userData.emailVerified ? "Yes" : "No"}</dd>
                <dt>Created</dt>
                <dd>{new Date(userData.createdAt).toLocaleDateString()}</dd>
                <dt>Updated</dt>
                <dd>{new Date(userData.updatedAt).toLocaleDateString()}</dd>
              </dl>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="btn btn-secondary btn-full"
            style={{ marginTop: "1.5rem" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
