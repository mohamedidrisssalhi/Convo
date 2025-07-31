import { useEffect } from "react";

export default function LinkErrorPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ linked: false, error: true }, "*");
      window.close();
    }
  }, []);
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Failed to link Google account</h2>
      <p>You can close this window and try again.</p>
    </div>
  );
}
