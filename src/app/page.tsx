// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // As soon as anyone hits “/”, send them to your login form
  redirect("/login");
}
