
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SupabaseTestPage() {
  const [result, setResult] = useState("Not tested yet");
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    setResult("Connecting to Supabase...");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("crops")
        .select("id")
        .limit(1);

      if (error) {
        setResult(`Database responded with an error: ${error.message}`);
      } else {
        setResult(
          "Connection successful! Supabase responded to the crops query."
        );
      }
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold">
        AgriFin — Supabase Connection Test
      </h1>

      <p className="mt-3 text-gray-600">
        This checks whether AgriFin can query the crops table.
      </p>

      <button
        onClick={testConnection}
        disabled={loading}
        className="mt-6 rounded-lg bg-green-700 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Supabase Connection"}
      </button>

      <p className="mt-5 break-words rounded-lg border p-4">
        {result}
      </p>
    </main>
  );
}
