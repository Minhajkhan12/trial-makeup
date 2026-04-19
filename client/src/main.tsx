import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[BeautyBooked] Uncaught error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "sans-serif",
          background: "#faf9f7",
          textAlign: "center",
        }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "#1a1a1a" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#888", marginBottom: "1.5rem", maxWidth: "360px" }}>
            We hit an unexpected error. Please refresh the page or try again in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#b87d8a",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "0.65rem 1.75rem",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
          {process.env.NODE_ENV !== "production" && (
            <pre style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#c00", textAlign: "left", maxWidth: "600px", overflowX: "auto" }}>
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
