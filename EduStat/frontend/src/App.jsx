import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    api.get("/api/health")
      .then((response) => {
        setStatus(response.data.status);
      })
      .catch(() => {
        setStatus("Backend unavailable");
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="rounded-3xl border border-white/20 bg-white/10 p-10 backdrop-blur-xl">
        <h1 className="text-4xl font-bold">EduStat</h1>
        <p className="mt-3 text-slate-300">
          Educational Data Statistical Analysis Platform
        </p>
        <p className="mt-5 text-cyan-400">
          Backend Status: {status}
        </p>
      </div>
    </main>
  );
}

export default App;