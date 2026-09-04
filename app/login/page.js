"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useName } from "@/lib/NameContext";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const { name, ready } = useName();
  const router = useRouter();

  useEffect(() => {
    if (ready && name) router.push("/");
  }, [ready, name, router]);

  if (!ready || name) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <AuthForm />
    </div>
  );
}
