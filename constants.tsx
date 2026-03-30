
import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Activity, 
  DollarSign, 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  Calendar,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Search,
  MapPin,
  ClipboardCheck,
  Zap,
  TrendingDown,
  Minus
} from 'lucide-react';

export const COLORS = {
  primary: '#358568', // Brand Green
  primaryLight: '#EBF4F0',
  line: '#B1D996',    // Brand Light Green for Lines
  background: '#F4F7F6',
  card: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  sidebar: '#000000', // Black sidebar as requested
  // New coordinated palette for KPI icons
  iconBg: {
    green: '#358568',
    teal: '#4BA987',
    lime: '#86C665',
    emerald: '#10B981',
    blue: '#3B82F6',
    indigo: '#6366F1'
  }
};

export const LOGO_URL = "https://www.tigermedgrp.com/public/uploads/2/c6/2c6d458a132433beb12fac35d964e9e5df7624a34a727f3a421d977380a75bb5.png";

export const ICONS = {
  Overview: <LayoutDashboard size={20} />,
  Operation: <Briefcase size={20} />,
  Projects: <Layers size={20} />,
  Financial: <DollarSign size={18} />,
  Enrollment: <Users size={18} />,
  Quality: <ClipboardCheck size={18} />,
  Time: <Calendar size={18} />,
  Filter: <Filter size={18} />,
  Trend: <TrendingUp size={18} />,
  TrendMix: (
    <div className="relative flex items-center justify-center w-7 h-7">
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <Target size={20} strokeWidth={2.5} />
      </div>
      <div className="relative bg-white/10 rounded-full p-0.5">
        <TrendingUp size={14} className="drop-shadow-sm text-white" />
      </div>
    </div>
  ),
  ModuleTitle: <Activity size={18} className="mr-2" />, // Color handled in component
  Bar: <BarChart3 size={18} />,
  Pie: <PieChart size={18} />,
  Project: <FileText size={18} />,
  Search: <Search size={18} />,
  Target: <Target size={18} />,
  Clock: <Clock size={18} />,
  Zap: <Zap size={18} />,
  Users: <Users size={18} />,
  AlertCircle: <AlertCircle size={18} />,
  CheckCircle2: <CheckCircle2 size={18} />,
  MapPin: <MapPin size={18} />
};

export const BUS = ['COBU', 'ECO', 'VPMS', 'IBU'];
export const MONTHS = [
  '202501', '202502', '202503', '202504', '202505', '202506', 
  '202507', '202508', '202509', '202510', '202511', '202512', '202601'
];
