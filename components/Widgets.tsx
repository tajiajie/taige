
import React, { useMemo } from 'react';
import { COLORS, ICONS } from '../constants';
import { KPI } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const KPICard: React.FC<KPI & { iconColor?: string; alignToSlot?: number; indent?: boolean; center?: boolean; className?: string }> = ({ 
  label, 
  value, 
  subValue, 
  subLabel, 
  icon, 
  trend, 
  iconColor,
  alignToSlot = 0,
  indent = false,
  center = false,
  className = ""
}) => {
  const bg = iconColor || COLORS.primary;
  
  const renderFormattedValue = () => {
    if (typeof value !== 'string') return <span className="text-2xl font-black text-gray-800">{value}</span>;
    
    const match = value.match(/^([\d,.\-%]+)\s*(.*)$/);
    if (!match) return <span className="text-2xl font-black text-gray-800">{value}</span>;
    
    const [, num, unit] = match;
    
    return (
      <div className="flex items-baseline">
        <span className="text-2xl font-black text-gray-800 tracking-tight">{num}</span>
        {unit && (
          <span className="text-xs font-bold text-gray-400 ml-0.5 uppercase">
            {unit}
          </span>
        )}
      </div>
    );
  };

  const subIndicatorLines = useMemo(() => {
    if (!subValue && !subLabel) return [];
    
    const rawLines = typeof subValue === 'string' ? subValue.split('\n') : [subValue?.toString() || ''];
    
    return rawLines.filter(Boolean).map((line, idx) => {
      // Clean up colons and pipes
      const cleanLine = line.replace(/[:|]/g, ' ').replace(/\s+/g, ' ').trim();
      
      let labelText = '';
      let valText = '';
      
      // Split by the first space to separate label from value
      if (cleanLine.includes(' ')) {
        const spaceIdx = cleanLine.indexOf(' ');
        labelText = cleanLine.substring(0, spaceIdx).trim();
        valText = cleanLine.substring(spaceIdx + 1).trim();
      } else {
        // If no space and it's the first line and subLabel exists, use subLabel as label
        if (subLabel && idx === 0) {
          labelText = subLabel.replace(/[:|]/g, '').trim();
          valText = cleanLine;
        } else {
          labelText = cleanLine;
        }
      }
      return { label: labelText, value: valText };
    });
  }, [subValue, subLabel]);

  return (
    <div className={`bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col justify-center min-h-[100px] hover:shadow-md transition-all duration-300 ${center ? 'items-center' : ''} ${className}`}>
      <div className={`flex flex-col space-y-1.5 ${center ? 'items-center w-full' : ''}`}>
        <div className={`flex items-center space-x-1.5 ${center ? 'justify-center' : ''}`}>
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-colors duration-300"
            style={{ backgroundColor: bg }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </div>
          <h3 className={`text-[#358568] font-bold text-[13px] tracking-tight whitespace-normal leading-tight ${center ? 'text-center' : 'text-left'}`}>{label}</h3>
        </div>

        <div className={`flex flex-col space-y-0.5 ${indent ? 'pl-8.5' : 'pl-0'} ${center ? 'items-center w-full' : ''}`}>
          <div className={`flex items-baseline space-x-1.5 border-b border-gray-50 pb-0.5 mb-0.5 ${center ? 'justify-center w-full' : 'justify-between'}`}>
            <div className={`flex items-baseline space-x-1.5 min-w-0 ${center ? 'justify-center' : 'flex-1'}`}>
              {renderFormattedValue()}
              {trend && (
                <span className={`flex items-center text-[8px] font-bold ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {trend === 'up' ? <TrendingUp size={8} className="mr-0.5" /> : trend === 'down' ? <TrendingDown size={8} className="mr-0.5" /> : <Minus size={8} className="mr-0.5" />}
                </span>
              )}
            </div>
          </div>

          {subIndicatorLines.map((ind, idx) => (
            <div key={idx} className={`flex items-start space-x-1.5 border-b border-gray-50 last:border-0 pb-0.5 last:pb-0 min-h-[16px] ${center ? 'justify-center w-full' : 'justify-between'}`}>
              <span className={`text-[11px] leading-tight text-gray-400 font-bold whitespace-normal flex-1 min-w-0 ${center ? 'text-center' : 'text-left'}`} title={ind.label}>{ind.label}</span>
              <span className={`text-gray-700 font-black text-[13px] tracking-tight leading-none flex-shrink-0 ${center ? 'text-center' : 'text-right'}`}>{ind.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HorizontalKPICard: React.FC<{
  label: string;
  icon: React.ReactNode;
  iconColor: string;
  items: { label: string; value: string }[];
}> = ({ label, icon, iconColor, items }) => (
  <div className="flex items-center space-x-4 px-2">
    <div 
      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
      style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: 2.5 })}
    </div>
    <div className="flex flex-col min-w-0">
      <div className="text-[#358568] font-bold text-lg leading-tight mb-2 truncate">{label}</div>
      <div className="flex flex-col space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-2 whitespace-normal">
            <span className="text-sm leading-tight text-gray-500 font-bold whitespace-normal text-left flex-1 min-w-0">
              {item.label.replace(/[:|]/g, '').trim()}
            </span>
            <span className="text-gray-800 font-black text-base tracking-tight leading-none text-right flex-shrink-0">
              {item.value.replace(/[:|]/g, '').trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CockpitKPICard: React.FC<KPI & { iconColor?: string }> = ({ 
  label, 
  value, 
  subValue, 
  icon, 
  iconColor 
}) => {
  const bg = iconColor || COLORS.primary;
  
  const lines = typeof subValue === 'string' ? subValue.split('\n') : [];
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex items-start justify-start space-x-2 mb-1">
        <div className="flex items-center space-x-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm"
            style={{ backgroundColor: bg }}
          >
            {React.cloneElement(icon as React.ReactElement, { size: 14 })}
          </div>
          <h3 className="text-[#358568] font-bold text-base tracking-tight truncate">{label}</h3>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-xl font-black text-gray-800 tracking-tight leading-none">{value}</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-0.5 mt-1">
        {lines.map((line, idx) => {
          const parts = line.split(' ');
          const labelPart = parts[0];
          const valuePart = parts.slice(1).join(' ');
          return (
            <div key={idx} className="flex items-center justify-start space-x-2 border-b border-gray-50 last:border-0 pb-0.5 last:pb-0">
              <span className="text-[11px] text-gray-400 font-bold">{labelPart}</span>
              <span className="text-[12px] text-gray-700 font-black">{valuePart}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MultiKPICard: React.FC<{ 
  title: string; 
  indicators: { label: string; value: string }[]; 
  icon: React.ReactNode;
  iconColor?: string;
  alignToSlot?: number;
  columns?: number;
  className?: string;
  indent?: boolean;
  titleValue?: string;
  titleValueLabel?: string;
  center?: boolean;
}> = ({ title, indicators, icon, iconColor, alignToSlot = 0, columns = 1, className = "", indent = false, titleValue, titleValueLabel, center = false }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow ${className} ${center ? 'items-center' : ''}`}>
    <div className={`flex flex-col space-y-3 ${center ? 'items-center w-full' : ''}`}>
      <div className={`flex items-center justify-between w-full ${center ? 'flex-col space-y-2' : ''}`}>
        <div className={`flex items-center space-x-3 min-w-0 flex-1 ${center ? 'justify-center' : ''}`}>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-colors duration-300"
            style={{ backgroundColor: iconColor || COLORS.primary }}
          >
            {icon}
          </div>
          <h3 className={`${(titleValue || titleValueLabel) ? 'text-base' : 'text-xl'} text-[#358568] font-bold tracking-tight truncate leading-tight ${center ? 'text-center' : 'text-left'}`}>{title}</h3>
        </div>
        {(titleValue || titleValueLabel) && (
          <div className={`flex items-baseline space-x-1.5 flex-shrink-0 ${center ? 'justify-center' : 'ml-2'}`}>
            {titleValueLabel && (
              <span className="text-xs text-gray-400 font-bold uppercase whitespace-nowrap">
                {titleValueLabel}
              </span>
            )}
            {titleValue && (
              <span className="text-gray-800 font-black text-lg tracking-tight leading-none">
                {titleValue}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`grid ${columns === 2 ? 'grid-cols-2 gap-x-4' : 'grid-cols-1'} gap-y-2 ${indent ? 'pl-[52px]' : 'pl-0'} ${center ? 'w-full' : ''}`}>
        {Array.from({ length: Math.max(indicators.length + alignToSlot, 2) }).map((_, slotIdx) => {
          const indicator = (slotIdx >= alignToSlot && slotIdx < alignToSlot + indicators.length) 
            ? indicators[slotIdx - alignToSlot] 
            : null;

          return (
            <div key={slotIdx} className={`flex items-start space-x-2 whitespace-normal ${columns === 2 ? '' : 'border-b border-gray-50 last:border-0 pb-1.5 last:pb-0'} min-h-[24px] ${center ? 'justify-center' : 'justify-between'}`}>
              {indicator ? (
                <>
                  <span className={`text-xs leading-tight text-gray-500 font-bold whitespace-normal min-w-0 ${center ? 'text-center' : 'text-left flex-1'}`} title={indicator.label}>
                    {indicator.label.replace(/[:|]/g, '').trim()}
                  </span>
                  <span className={`text-gray-800 font-black text-lg tracking-tight leading-none flex-shrink-0 ${center ? 'text-center' : 'text-right'}`}>
                    {indicator.value.replace(/[:|]/g, '').trim()}
                  </span>
                </>
              ) : (
                <div className="opacity-0">-</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export const FinancialKPICard: React.FC<{
  title: string;
  icon: React.ReactNode;
  iconColor?: string;
  titleValue?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, iconColor, titleValue, children, className = "" }) => (
  <div className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col min-h-[110px] hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm"
          style={{ backgroundColor: iconColor || COLORS.primary }}
        >
          {React.cloneElement(icon as React.ReactElement, { size: 14 })}
        </div>
        <h3 className="text-sm text-[#358568] font-bold tracking-tight">{title}</h3>
      </div>
      {titleValue && (
        <span className="text-gray-800 font-black text-sm tracking-tight">{titleValue}</span>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-start">
      {children}
    </div>
  </div>
);

export const DashboardModule: React.FC<{ 
  title: string; 
  icon?: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  titleClassName?: string;
  extra?: React.ReactNode;
  transparent?: boolean;
}> = ({ title, icon, children, className = "", titleClassName = "text-base font-black", extra, transparent }) => (
  <div className={`${transparent ? '' : 'bg-white rounded-xl shadow-sm border border-gray-100 p-3'} ${className} flex flex-col`}>
    {!transparent && (
      <div className="flex items-center justify-between mb-1.5 border-b border-gray-50 pb-1.5">
        <div className="flex items-center text-[#358568]">
          {icon ? React.cloneElement(icon as React.ReactElement<any>, { className: 'mr-2', size: 16 }) : React.cloneElement(ICONS.ModuleTitle as React.ReactElement<any>, { className: 'mr-2', size: 16 })}
          <h2 className={`${titleClassName} tracking-tight uppercase`}>{title}</h2>
        </div>
        {extra}
      </div>
    )}
    <div className="flex-1 min-h-0 relative">
      {children}
    </div>
  </div>
);
