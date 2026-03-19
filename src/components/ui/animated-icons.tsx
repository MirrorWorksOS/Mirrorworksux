/**
 * Animated Icons - Subtle icon animations using CSS transforms
 * Based on animate-ui patterns but optimized for manufacturing UI
 */

import React from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Send,
  Download,
  Trash2,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  Eye,
  Clock,
  Loader2,
  Zap,
  ArrowRight,
  ChevronRight,
  Save,
  X,
  Check,
  Info,
  HelpCircle,
  Calendar,
  FileText,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import { cn } from './utils';

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

// Spin animation (for refresh, loading)
export const AnimatedRefresh = ({ className, size = 16 }: AnimatedIconProps) => (
  <RefreshCw 
    className={cn(
      "animate-[spin_2s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedLoader = ({ className, size = 16 }: AnimatedIconProps) => (
  <Loader2 
    className={cn(
      "animate-[spin_1s_linear_infinite]",
      className
    )} 
    size={size} 
  />
);

// Pulse animation (for alerts, notifications)
export const AnimatedBell = ({ className, size = 16 }: AnimatedIconProps) => (
  <Bell 
    className={cn(
      "animate-[wiggle_2s_ease-in-out_infinite]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedAlertTriangle = ({ className, size = 16 }: AnimatedIconProps) => (
  <AlertTriangle 
    className={cn(
      "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
      className
    )} 
    size={size} 
  />
);

// Bounce animation (for success states)
export const AnimatedCheckCircle = ({ className, size = 16 }: AnimatedIconProps) => (
  <CheckCircle2 
    className={cn(
      "animate-[bounce-subtle_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedCheck = ({ className, size = 16 }: AnimatedIconProps) => (
  <Check 
    className={cn(
      "animate-[scale-in_0.3s_cubic-bezier(0.68,-0.55,0.265,1.55)]",
      className
    )} 
    size={size} 
  />
);

// Trend animations (for financial data)
export const AnimatedTrendingUp = ({ className, size = 16 }: AnimatedIconProps) => (
  <TrendingUp 
    className={cn(
      "animate-[slide-up_0.5s_cubic-bezier(0.05,0.7,0.1,1.0)]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedTrendingDown = ({ className, size = 16 }: AnimatedIconProps) => (
  <TrendingDown 
    className={cn(
      "animate-[slide-down_0.5s_cubic-bezier(0.05,0.7,0.1,1.0)]",
      className
    )} 
    size={size} 
  />
);

// Hover animations (for interactive buttons)
export const AnimatedSend = ({ className, size = 16 }: AnimatedIconProps) => (
  <Send 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
      className
    )} 
    size={size} 
  />
);

export const AnimatedDownload = ({ className, size = 16 }: AnimatedIconProps) => (
  <Download 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:translate-y-0.5",
      className
    )} 
    size={size} 
  />
);

export const AnimatedTrash = ({ className, size = 16 }: AnimatedIconProps) => (
  <Trash2 
    className={cn(
      "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:scale-110 group-hover:text-[#EF4444]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedArrowRight = ({ className, size = 16 }: AnimatedIconProps) => (
  <ArrowRight 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:translate-x-1",
      className
    )} 
    size={size} 
  />
);

export const AnimatedChevronRight = ({ className, size = 16 }: AnimatedIconProps) => (
  <ChevronRight 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:translate-x-0.5",
      className
    )} 
    size={size} 
  />
);

// Rotate animations (for settings, filters)
export const AnimatedSettings = ({ className, size = 16 }: AnimatedIconProps) => (
  <Settings 
    className={cn(
      "transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:rotate-45",
      className
    )} 
    size={size} 
  />
);

export const AnimatedFilter = ({ className, size = 16 }: AnimatedIconProps) => (
  <Filter 
    className={cn(
      "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);

// Scale animations (for add, close buttons)
export const AnimatedPlus = ({ className, size = 16 }: AnimatedIconProps) => (
  <Plus 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:rotate-90",
      className
    )} 
    size={size} 
  />
);

export const AnimatedX = ({ className, size = 16 }: AnimatedIconProps) => (
  <X 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:rotate-90 group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);

// Shine/Sparkle animation (for AI features)
export const AnimatedSparkles = ({ className, size = 16 }: AnimatedIconProps) => (
  <Sparkles 
    className={cn(
      "animate-[sparkle_2s_ease-in-out_infinite]",
      className
    )} 
    size={size} 
  />
);

export const AnimatedZap = ({ className, size = 16 }: AnimatedIconProps) => (
  <Zap 
    className={cn(
      "animate-[pulse_1.5s_ease-in-out_infinite]",
      className
    )} 
    size={size} 
  />
);

// Dollar sign with subtle pulse (for financial emphasis)
export const AnimatedDollarSign = ({ className, size = 16 }: AnimatedIconProps) => (
  <DollarSign 
    className={cn(
      "animate-[pulse-subtle_2s_ease-in-out_infinite]",
      className
    )} 
    size={size} 
  />
);

// Subtle eye blink animation
export const AnimatedEye = ({ className, size = 16 }: AnimatedIconProps) => (
  <Eye 
    className={cn(
      "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);

// Clock with tick animation
export const AnimatedClock = ({ className, size = 16 }: AnimatedIconProps) => (
  <Clock 
    className={cn(
      "animate-[tick_1s_steps(12)_infinite]",
      className
    )} 
    size={size} 
  />
);

// Save with bounce
export const AnimatedSave = ({ className, size = 16 }: AnimatedIconProps) => (
  <Save 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);

// Search with subtle pulse
export const AnimatedSearch = ({ className, size = 16 }: AnimatedIconProps) => (
  <Search 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);

// Info with subtle pulse
export const AnimatedInfo = ({ className, size = 16 }: AnimatedIconProps) => (
  <Info 
    className={cn(
      "animate-[pulse-subtle_2s_ease-in-out_infinite]",
      className
    )} 
    size={size} 
  />
);

// Help circle with wiggle
export const AnimatedHelpCircle = ({ className, size = 16 }: AnimatedIconProps) => (
  <HelpCircle 
    className={cn(
      "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] group-hover:scale-110",
      className
    )} 
    size={size} 
  />
);
