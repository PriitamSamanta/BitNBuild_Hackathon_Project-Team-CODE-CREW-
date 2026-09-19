"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/api/health");

        if (response.data.success) {
          setStatus("Backend connected successfully");
        }
      } catch (error) {
        console.error(error);
        setStatus("Backend connection failed");
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">ResQAI</h1>

        <p className="mt-4 text-lg">
          Intelligent Emergency Response Platform
        </p>

        <p className="mt-6">
          {status}
        </p>
      </div>
    </main>
  );
}