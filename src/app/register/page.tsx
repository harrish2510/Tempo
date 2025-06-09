"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default function RegisterPage() {
  const router = useRouter();

  async function registerAndLogin(email: string, password: string) {
    // 1) Register as STUDENT
    const res1 = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res1.ok) {
      throw new Error("Register failed");
    }

    // 2) Immediately log in
    const res2 = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res2.ok) {
      throw new Error("Login after register failed");
    }
    const { role } = await res2.json();
    if (role === "STAFF") {
      router.replace("/staff/create-assignment");
    } else {
      router.replace("/student/dashboard");
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Register</h1>
      <LoginForm onSubmit={registerAndLogin} submitLabel="Register" />
      <p style={{ textAlign: "center" }}>
        Already have an account? <a href="/login">Sign In</a>
      </p>
    </div>
  );
}
