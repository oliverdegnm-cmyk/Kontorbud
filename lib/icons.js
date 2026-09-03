"use client";

import { Calculator, Headphones, Keyboard, Languages, PenTool, Calendar, FileText, Archive, Palette, Presentation, Sparkles, Globe, MoreHorizontal } from "lucide-react";

export const ICONS = { Calculator, Headphones, Keyboard, Languages, PenTool, Calendar, FileText, Archive, Palette, Presentation, Sparkles, Globe, MoreHorizontal };

export function CatIcon({ name, size = 18 }) {
  const Icon = ICONS[name] || FileText;
  return <Icon size={size} />;
}
