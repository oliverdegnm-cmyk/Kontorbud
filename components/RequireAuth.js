"use client";

import { useName } from "@/lib/NameContext";
import AuthForm from "@/components/AuthForm";

export default function RequireAuth({ children, title, subtitle }) {
  const { name, ready } = useName();

  if (!ready) return null;

  if (!name) {
    return (
      <div style={{ marginTop: 24 }}>
        <AuthForm
          title={title || "Log ind for at fortsætte"}
          subtitle={subtitle || "Du skal være logget ind for at se denne side."}
        />
      </div>
    );
  }

  return children;
}
