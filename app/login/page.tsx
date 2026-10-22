
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function setupFarm(user: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  }) {
    console.log("[AgriFin Debug] setupFarm started");

    const supabase = createClient();

    const { data: existingProfile, error: profileReadError } =
      await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .maybeSingle();

    if (profileReadError) throw profileReadError;

    console.log("[AgriFin Debug] profile check completed");

    if (!existingProfile) {
      const { error: profileInsertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || name || "",
          village: "",
          preferred_language: "en",
        });

      if (profileInsertError) throw profileInsertError;
    } else if (
      !existingProfile.full_name &&
      (user.user_metadata?.full_name || name)
    ) {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name: user.user_metadata?.full_name || name,
        })
        .eq("id", user.id);

      if (profileUpdateError) throw profileUpdateError;
    }

    const { data: farm, error: farmError } = await supabase
      .from("farms")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (farmError) throw farmError;

    console.log("[AgriFin Debug] farm check completed");

    if (!farm) {
      const { error: farmInsertError } = await supabase
        .from("farms")
        .insert({
          owner_id: user.id,
          farm_name: "My Farm",
          village: "",
        });

      if (farmInsertError) throw farmInsertError;
    }

    console.log("[AgriFin Debug] navigating to dashboard");

    router.replace("/");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");

    console.log("[AgriFin Debug] form submitted; mode:", mode);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          console.log("[AgriFin Debug] signup succeeded");
          await setupFarm(data.user);
          console.log("[AgriFin Debug] setupFarm completed");
        } else {
          setMessage(
            "Account created! Check your email to confirm your account, then return here and sign in."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;
        if (!data.user) {
          throw new Error("Could not load your account.");
        }

        console.log("[AgriFin Debug] sign-in succeeded");

        console.log("[AgriFin Debug] calling setupFarm");
        await setupFarm(data.user);

        console.log("[AgriFin Debug] setupFarm completed");
      }
    } catch (error) {
      console.error("[AgriFin Debug] login/setup failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
      console.log("[AgriFin Debug] form handler finished");
    }
  }

  return (
    <main className="mx-auto max-w-md p-6 sm:py-16">
      <h1 className="text-3xl font-bold">AgriFin</h1>

      <p className="mt-2 text-gray-600">
        Your farm finances, all in one place.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage("");
          }}
          className={`flex-1 rounded-lg border p-3 ${
            mode === "signup" ? "bg-green-700 text-white" : ""
          }`}
        >
          Create account
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={`flex-1 rounded-lg border p-3 ${
            mode === "login" ? "bg-green-700 text-white" : ""
          }`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1 block">Farmer name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Your full name"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block">Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block">Password</span>
          <input
            required
            type="password"
            minLength={8}
            autoComplete={
              mode === "signup"
                ? "new-password"
                : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            placeholder="At least 8 characters"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-green-700 p-3 font-semibold text-white disabled:opacity-50"
        >
          {busy
            ? "Please wait..."
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {message && (
        <p
          role="status"
          className="mt-5 break-words rounded-lg border p-3"
        >
          {message}
        </p>
      )}
    </main>
  );
}
