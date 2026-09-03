"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const NameContext = createContext(null);

export function NameProvider({ children }) {
  const [name, setNameState] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");

  function applyUser(user) {
    setNameState(user.name);
    setEmail(user.email);
    setEmailVerified(!!user.emailVerified);
    setIsAdmin(!!user.isAdmin);
    setPhone(user.phone || "");
    setEmailNotifications(user.emailNotifications !== false);
    setSmsNotifications(!!user.smsNotifications);
    setAvatarUrl(user.avatarUrl || null);
  }

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) applyUser(data.user);
    } catch (e) {
      // rolig - beholder eksisterende state, hvis netværket driller
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) applyUser(data.user);
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
      applyUser(data.user);
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
      applyUser(data.user);
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
    <NameContext.Provider
      value={{
        name,
        email,
        emailVerified,
        isAdmin,
        phone,
        emailNotifications,
        smsNotifications,
        avatarUrl,
        ready,
        login,
        signup,
        logOut,
        refresh,
        authError,
        setAuthError,
      }}
    >
      {children}
    </NameContext.Provider>
  );
}

export function useName() {
  const ctx = useContext(NameContext);
  if (!ctx) throw new Error("useName skal bruges inden i NameProvider");
  return ctx;
}
