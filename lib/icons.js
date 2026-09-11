"use client";

import {
  Calculator,
  Headphones,
  Keyboard,
  Languages,
  PenTool,
  Calendar,
  FileText,
  Archive,
  Palette,
  Presentation,
  Sparkles,
  Globe,
  MoreHorizontal,
  Users,
  ListChecks,
  Megaphone,
  Wallet,
  Workflow,
  MessageCircle,
  Image,
  BarChart3,
  Brain,
  Plug,
  Compass,
  GraduationCap,
  Mic,
} from "lucide-react";

export const ICONS = {
  Calculator,
  Headphones,
  Keyboard,
  Languages,
  PenTool,
  Calendar,
  FileText,
  Archive,
  Palette,
  Presentation,
  Sparkles,
  Globe,
  MoreHorizontal,
  Users,
  ListChecks,
  Megaphone,
  Wallet,
  Workflow,
  MessageCircle,
  Image,
  BarChart3,
  Brain,
  Plug,
  Compass,
  GraduationCap,
  Mic,
};

export function CatIcon({ name, size = 18 }) {
  const Icon = ICONS[name] || FileText;
  return <Icon size={size} />;
}
