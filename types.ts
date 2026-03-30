
import React from 'react';

export type DashboardView = 'Overview' | 'Operation' | 'Progress' | 'Quality' | 'Financial' | 'ProjectDetail' | 'Icons';
export type ProjectSubView = 'Financial' | 'Quality' | 'Progress';
export type UserRole = 'BU head' | 'DO' | 'PM';

export interface KPI {
  label: string;
  value: string | number;
  subValue?: string | number;
  subLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface ProjectHealth {
  id: string;
  name: string;
  quality: number;
  progress: number;
  financial: number;
  people: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}
