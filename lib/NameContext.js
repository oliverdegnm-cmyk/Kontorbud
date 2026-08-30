"use client";

import { createContext, useContext, useEffect, useState } from "react";

const NameContext = createContext(null);

export function NameProvider({ children }) {
  const [name, setNameState] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setNameState(data.user.name);
          setEmail(data.user.email);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  async function login(loginEmail, password) {
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password }),
      });
      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        return false;
      }
      setNameState(data.user.name);
      setEmail(data.user.email);
      return true;
    } catch (e) {
      setAuthError("Kunne ikke logge ind. Prøv igen.");
      return false;
    }
  }

  async function signup(signupName, signupEmail, password) {
    setAuthError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password }),
      });
      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        return false;
      }
      setNameState(data.user.name);
      setEmail(data.user.email);
      return true;
    } catch (e) {
      setAuthError("Kunne ikke oprette konto. Prøv igen.");
      return false;
    }
  }

  async function logOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setNameState("");
    setEmail("");
  }

  return (
    <NameContext.Provider value={{ name, email, ready, login, signup, logOut, authError, setAuthError }}>
      {children}
    </NameContext.Provider>
  );
}

export function useName() {
  const ctx = useContext(NameContext);
  if (!ctx) throw new Error("useName skal bruges inden i NameProvider");
  return ctx;
}
