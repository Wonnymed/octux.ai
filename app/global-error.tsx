"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        color: "#111111",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        textAlign: "center",
        padding: "40px 20px",
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          color: "#9CA3AF",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>Error</span>
        <h1 style={{
          fontSize: 28,
          fontWeight: 500,
          color: "#111111",
          margin: "0 0 10px",
          lineHeight: 1.3,
        }}>Something went wrong</h1>
        <p style={{
          fontSize: 14,
          color: "#5B5B5B",
          margin: "0 0 28px",
          lineHeight: 1.6,
          maxWidth: 440,
        }}>
          An unexpected error interrupted this page. You can try again or return to the product.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "9px 22px",
              borderRadius: 8,
              background: "#C8A84E",
              border: "none",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >Try again</button>
          <a
            href="/chat"
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              background: "#FAFAF7",
              border: "1px solid #E8E8E3",
              color: "#5B5B5B",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >Go Home</a>
        </div>
      </body>
    </html>
  );
}
