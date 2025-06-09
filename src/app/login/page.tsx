"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Login failed");
    }

    const { role } = await res.json();
    if (role === "STAFF") {
      router.replace("/staff/create-assignment");
    } else {
      router.replace("/student/dashboard");
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Sign In</h1>
      <LoginForm onSubmit={login} submitLabel="Sign In" />
      <p style={{ textAlign: "center" }}>
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
