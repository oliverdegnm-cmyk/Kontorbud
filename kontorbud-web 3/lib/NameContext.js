"use client";

import { createContext, useContext, useEffect, useState } from "react";

const NameContext = createContext(null);

export function NameProvider({ children }) {
  const [name, setNameState] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("kontorbud-name");
    if (stored) setNameState(stored);
    setReady(true);
  }, []);

  function setName(n) {
    setNameState(n);
    window.localStorage.setItem("kontorbud-name", n);
  }

  return <NameContext.Provider value={{ name, setName, ready }}>{children}</NameContext.Provider>;
}

export function useName() {
  const ctx = useContext(NameContext);
  if (!ctx) throw new Error("useName skal bruges inden i NameProvider");
  return ctx;
}
