import { useEffect } from "react";

export default function LinkSuccessPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ linked: true }, "*");
      window.close();
    }
  }, []);
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Google account linked!</h2>
      <p>You can close this window.</p>
    </div>
  );
}
