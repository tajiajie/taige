
import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart, Line, ReferenceLine
} from 'recharts';
import { DashboardModule, KPICard, MultiKPICard, FinancialKPICard, CockpitKPICard } from '../components/Widgets';
import { COLORS, MONTHS, BUS } from '../constants';
import { ProjectSubView, UserRole, DashboardView } from '../types';
import { 
  Clock, Monitor, Database, Library, Target, Building2, TrendingUp, DollarSign, CheckCircle2, Users, UserCheck, AlertTriangle, AlertCircle, PieChart as PieChartIcon, Layers, FileText, ClipboardCheck, Zap, Package, Percent, Receipt, Wallet, Coins, Scale, BarChart3, LayoutGrid, Boxes, Landmark, ChevronRight, ChevronLeft, Archive, Activity
} from 'lucide-react';

interface ProjectDetailProps {
  subView?: ProjectSubView;
  activeTab?: ProjectSubView;
  setActiveTab?: (tab: ProjectSubView) => void;
  projectName: string;
  selectedMonth: string;
  selectedBUs: string[];
  setSelectedBUs: (bus: string[]) => void;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
  selectedProjects: string[];
  setSelectedProjects: (ps: string[]) => void;
  // Drill-down props lifted to App
  progressDrillLevel?: 0 | 1 | 2;
  setProgressDrillLevel?: (l: 0 | 1 | 2) => void;
  progressBU?: string;
  setProgressBU?: (s: string) => void;
  progressPM?: string;
  setProgressPM?: (s: string) => void;
  setActiveView?: (view: DashboardView) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  subView, activeTab, setActiveTab, projectName, selectedMonth, selectedBUs, setSelectedBUs, userRole, setUserRole, selectedProjects, setSelectedProjects,
  progressDrillLevel, setProgressDrillLevel, progressBU, setProgressBU, progressPM, setProgressPM, setActiveView
}) => {

  const isProjectSpecific = selectedProjects.length === 1;

  // Use local tab state if activeTab is provided (from App for the 'Enrollment' view), 
  // otherwise fallback to the lifted state (for sidebar navigation).
  const currentTab = activeTab || subView || 'Quality';

  return (
    <div className="space-y-4 flex flex-col h-full overflow-hidden">
      {/* 
         Tab Switcher for 'Project Details' (项目明细). 
         ORDER: Quality -> Progress -> Financial per request.
      */}
      {isProjectSpecific && setActiveTab && (
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start mb-2">
          {[
            { id: 'Quality', label: '项目质量', icon: <ClipboardCheck size={14} /> },
            { id: 'Progress', label: '项目进度', icon: <TrendingUp size={14} /> },
            { id: 'Financial', label: '项目财务', icon: <DollarSign size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProjectSubView)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                currentTab === tab.id 
                  ? 'bg-[#358568] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {currentTab === 'Progress' && (
          <ProgressAnalysis 
            selectedMonth={selectedMonth} 
            projectName={projectName}
            selectedBUs={selectedBUs}
            setSelectedBUs={setSelectedBUs}
            drillLevel={progressDrillLevel || 0}
            setDrillLevel={setProgressDrillLevel}
            selectedBU={progressBU || ''}
            setSelectedBU={setProgressBU}
            selectedPM={progressPM || ''}
            setSelectedPM={setProgressPM}
            selectedProjects={selectedProjects}
          />
        )}
        {currentTab === 'Financial' && (
          <FinancialAnalysis 
            selectedMonth={selectedMonth} 
            selectedBUs={selectedBUs} 
            selectedProjects={selectedProjects} 
          />
        )}
        {currentTab === 'Quality' && (
          <QualityAnalysis 
            selectedMonth={selectedMonth} 
            selectedBUs={selectedBUs} 
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            setActiveTab={setActiveTab}
            setActiveView={setActiveView}
          />
        )}
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string; icon: React.ReactNode; extra?: React.ReactNode }> = ({ title, icon, extra }) => (
  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
    <div className="flex items-center text-[#358568]">
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'mr-3' })}
      <h2 className="text-xl font-black tracking-tight uppercase">{title}</h2>
    </div>
    {extra}
  </div>
);

const ProgressAnalysis: React.FC<{ 
  selectedMonth: string; 
  projectName: string;
  selectedBUs: string[];
  setSelectedBUs: (bus: string[]) => void;
  drillLevel: number;
  setDrillLevel?: (l: 0 | 1 | 2) => void;
  selectedBU: string;
  setSelectedBU?: (s: string) => void;
  selectedPM: string;
  setSelectedPM?: (s: string) => void;
  selectedProjects: string[];
}> = ({ selectedMonth, projectName, selectedBUs, setSelectedBUs, drillLevel, setDrillLevel, selectedBU, setSelectedBU, selectedPM, setSelectedPM, selectedProjects }) => {
  
  const isProjectSpecific = selectedProjects.length === 1;

  const deriveVal = React.useCallback((base: number, variance: number, subSeed: string) => {
    const combined = selectedMonth + (selectedBUs.join('|')) + (selectedProjects.join('|')) + subSeed;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = (Math.abs(hash) % 100) / 100;
    return base + (rand * variance * 2 - variance);
  }, [selectedMonth, selectedBUs, selectedProjects]);

  const progressSummary = useMemo(() => {
    return {
      deliveryRate: deriveVal(88.5, 3, 'delivery').toFixed(2) + ' %',
      fte: [
        Math.round(deriveVal(168, 20, 'fte3')),
        Math.round(deriveVal(369, 40, 'fte6')),
        Math.round(deriveVal(812, 80, 'fte12'))
      ],
      revenue: [
        Math.round(deriveVal(1680, 200, 'rev3')).toLocaleString(),
        Math.round(deriveVal(4210, 500, 'rev6')).toLocaleString(),
        Math.round(deriveVal(7632, 800, 'rev12')).toLocaleString()
      ],
      kpis: [
        deriveVal(42, 5, 'kpi1').toFixed(2) + ' %',
        deriveVal(44, 5, 'kpi2').toFixed(2) + ' %',
        deriveVal(52, 5, 'kpi3').toFixed(2) + ' %',
        deriveVal(31, 5, 'kpi4').toFixed(2) + ' %',
        deriveVal(54, 5, 'kpi5').toFixed(2) + ' %',
        deriveVal(94, 2, 'kpi6').toFixed(2) + ' %'
      ],
      efficiency: {
        zero3m: deriveVal(6.2, 2, 'eff1').toFixed(1) + ' %',
        zero: deriveVal(4.5, 1.5, 'eff2').toFixed(1) + ' %',
        timely: deriveVal(82.1, 5, 'eff3').toFixed(1) + ' %',
        setup: deriveVal(12.8, 3, 'eff4').toFixed(1) + ' 天',
        ethics: deriveVal(16.2, 4, 'eff5').toFixed(1) + ' 天',
        start: deriveVal(43.5, 10, 'eff6').toFixed(1) + ' 天',
        agreement: deriveVal(26.1, 8, 'eff7').toFixed(1) + ' 天',
        agreementToStart: deriveVal(17.4, 5, 'eff8').toFixed(1) + ' 天',
        close: deriveVal(19.8, 5, 'eff9').toFixed(1) + ' 天',
        timelyClose: deriveVal(90.5, 4, 'eff10').toFixed(1) + ' %'
      }
    };
  }, [deriveVal]);

  const allBUsData = useMemo(() => [
    { name: 'COBU', a: deriveVal(42, 5, 'COBUa').toFixed(2) + ' %', b: deriveVal(44, 5, 'COBUb').toFixed(2) + ' %', c: deriveVal(52, 5, 'COBUc').toFixed(2) + ' %', d: deriveVal(31, 5, 'COBUd').toFixed(2) + ' %', e: deriveVal(54, 5, 'COBUe').toFixed(2) + ' %', f: deriveVal(94, 2, 'COBUf').toFixed(2) + ' %' },
    { name: 'IBU', a: deriveVal(35, 5, 'IBUa').toFixed(2) + ' %', b: deriveVal(36, 5, 'IBUb').toFixed(2) + ' %', c: deriveVal(59, 5, 'IBUc').toFixed(2) + ' %', d: deriveVal(32, 5, 'IBUd').toFixed(2) + ' %', e: deriveVal(59, 5, 'IBUe').toFixed(2) + ' %', f: deriveVal(84, 2, 'IBUf').toFixed(2) + ' %' },
    { name: 'ECO', a: deriveVal(34, 5, 'ECOa').toFixed(2) + ' %', b: deriveVal(36, 5, 'ECOb').toFixed(2) + ' %', c: deriveVal(66, 5, 'ECOc').toFixed(2) + ' %', d: deriveVal(26, 5, 'ECOd').toFixed(2) + ' %', e: deriveVal(50, 5, 'ECOe').toFixed(2) + ' %', f: deriveVal(82, 2, 'ECOf').toFixed(2) + ' %' },
    { name: 'VPMS', a: deriveVal(35, 5, 'VPMSa').toFixed(2) + ' %', b: deriveVal(37, 5, 'VPMSb').toFixed(2) + ' %', c: deriveVal(72, 5, 'VPMSc').toFixed(2) + ' %', d: deriveVal(30, 5, 'VPMSd').toFixed(2) + ' %', e: deriveVal(50, 5, 'VPMSe').toFixed(2) + ' %', f: deriveVal(89, 2, 'VPMSf').toFixed(2) + ' %' },
  ], [deriveVal]);

  const filteredBUs = useMemo(() => {
    if (selectedBUs.length === 0 || selectedBUs.length === BUS.length) return allBUsData;
    return allBUsData.filter(bu => selectedBUs.includes(bu.name));
  }, [selectedBUs, allBUsData]);

  const pmNames = ["刘颖", "张健", "赵敏", "李强", "王芳", "陈龙", "徐静", "孙鹏", "周杰", "马丽", "胡建国", "吴小莉", "谢宇", "郭建"];
  const pmData = useMemo(() => pmNames.map((name, i) => ({
    name: `${name} (PM)`,
    a: deriveVal(42, 10, name + 'a').toFixed(2) + " %",
    b: deriveVal(44, 10, name + 'b').toFixed(2) + " %",
    c: deriveVal(52, 10, name + 'c').toFixed(2) + " %",
    d: deriveVal(31, 10, name + 'd').toFixed(2) + " %",
    e: deriveVal(54, 10, name + 'e').toFixed(2) + " %",
    f: deriveVal(94, 5, name + 'f').toFixed(2) + " %",
  })), [selectedBU, deriveVal]);

  const projectNames = ["鸿运华宁-GMA102", "万泰生物-WT-021", "君实生物-JS001", "康希诺-CN-09", "信达生物-IBI306", "恒瑞-SH-0911", "君实-JS-002", "复星医药-FS001", "药明生物-WXB-902", "齐鲁制药-QL-902"];
  const projectPool = useMemo(() => projectNames.map(name => ({
    name,
    setup: deriveVal(12, 3, name + 'setup').toFixed(1) + ' 天',
    ethics: deriveVal(24, 5, name + 'ethics').toFixed(1) + ' 天',
    start: deriveVal(40, 8, name + 'start').toFixed(1) + ' 天',
    agreement: deriveVal(26, 5, name + 'agreement').toFixed(1) + ' 天',
    agreementToStart: deriveVal(14, 3, name + 'agreementToStart').toFixed(1) + ' 天',
    close: deriveVal(18, 4, name + 'close').toFixed(1) + ' 天',
    isTimelyStart: deriveVal(0.7, 0.3, name + 'isTimelyStart') > 0.5 ? '是' : '否',
    isZero3Month: deriveVal(0.1, 0.1, name + 'isZero3Month') > 0.15 ? '是' : '否',
    isZero: deriveVal(0.05, 0.05, name + 'isZero') > 0.08 ? '是' : '否',
    isTimelyClose: deriveVal(0.85, 0.1, name + 'isTimelyClose') > 0.5 ? '是' : '否'
  })), [deriveVal]);

  const filteredProjects = useMemo(() => {
    if (selectedProjects.length === 0) return projectPool;
    return projectPool.filter(p => selectedProjects.includes(p.name));
  }, [selectedProjects, projectPool]);

  // Center-level data generation with realistic Chinese hospital names
  const centerDetailData = useMemo(() => {
    const hospitals = [
      "北京协和医院", "四川大学华西医院", "中国人民解放军总医院", 
      "复旦大学附属中山医院", "华中科技大学同济医学院附属同济医院", 
      "复旦大学附属华山医院", "中山大学附属第一医院", "浙江大学医学院附属第一医院", 
      "上海交通大学医学院附属瑞金医院", "华中科技大学同济医学院附属协和医院", 
      "中南大学湘雅医院", "北京大学第一医院", "南京鼓楼医院", 
      "广东省人民医院", "山东大学齐鲁医院"
    ];
    
    return Array.from({ length: 12 }, (_, i) => {
      const name = hospitals[i % hospitals.length];
      return {
        name,
        isZero3Month: deriveVal(0.1, 0.1, name + 'isZero3Month') > 0.15 ? '是' : '否',
        isZero: deriveVal(0.05, 0.05, name + 'isZero') > 0.08 ? '是' : '否',
        isTimelyStart: deriveVal(0.7, 0.3, name + 'isTimelyStart') > 0.5 ? '是' : '否',
        setupTime: deriveVal(12, 3, name + 'setup').toFixed(1) + ' 天',
        ethicsTime: deriveVal(24, 5, name + 'ethics').toFixed(1) + ' 天',
        startTime: deriveVal(40, 8, name + 'start').toFixed(1) + ' 天',
        agreementTime: deriveVal(26, 5, name + 'agreement').toFixed(1) + ' 天',
        agreementToStartTime: deriveVal(14, 3, name + 'agreementToStart').toFixed(1) + ' 天',
        closeTime: deriveVal(18, 4, name + 'close').toFixed(1) + ' 天',
        isTimelyClose: deriveVal(0.85, 0.1, name + 'isTimelyClose') > 0.5 ? '是' : '否',
      };
    });
  }, [deriveVal, projectName]);

  const renderProjectLevel = () => (
    <div className="flex flex-col space-y-6 h-full overflow-hidden pb-4">
      <div className="space-y-4">
        <SectionTitle title={`${projectName} 进度分析`} icon={<TrendingUp size={20} />} />
        <div className="grid grid-cols-9 gap-3">
          <KPICard label="启动后3个月后0入组中心比例" value={progressSummary.efficiency.zero3m} icon={<Users size={16} />} center />
          <KPICard label="0入组中心比例" value={progressSummary.efficiency.zero} icon={<Users size={16} />} center />
          <KPICard label="中心启动及时达成率" value={progressSummary.efficiency.timely} icon={<Target size={16} />} center />
          <KPICard label="中心立项平均时长" value={progressSummary.efficiency.setup} icon={<Clock size={16} />} center />
          <KPICard label="中心伦理平均时长" value={progressSummary.efficiency.ethics} icon={<Monitor size={16} />} center />
          <KPICard 
            label="中心启动平均时长" 
            value={progressSummary.efficiency.start} 
            icon={<Database size={16} />} 
            center 
            className="col-span-2"
            subValue={`中心协议签署平均时长 ${progressSummary.efficiency.agreement}\n协议签署到启动平均时长 ${progressSummary.efficiency.agreementToStart}`}
          />
          <KPICard label="中心关闭平均时长" value={progressSummary.efficiency.close} icon={<Archive size={16} />} center />
          <KPICard label="中心及时关闭率" value={progressSummary.efficiency.timelyClose} icon={<CheckCircle2 size={16} />} center />
        </div>
      </div>

      <div className="space-y-4 flex-1 min-h-0 flex flex-col">
        <SectionTitle title={`${projectName} 进度详情`} icon={<Building2 size={20} />} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-[#358568] text-white sticky top-0 z-10">
                <tr className="text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">中心名称</th>
                  <th className="px-4 py-4 font-bold text-center">启动3个月后是否0入组</th>
                  <th className="px-4 py-4 font-bold text-center">是否0入组</th>
                  <th className="px-4 py-4 font-bold text-center">中心是否及时启动</th>
                  <th className="px-4 py-4 font-bold text-center">中心立项时长</th>
                  <th className="px-4 py-4 font-bold text-center">中心伦理时长</th>
                  <th className="px-4 py-4 font-bold text-center">中心启动时长</th>
                  <th className="px-4 py-4 font-bold text-center">中心协议签署时长</th>
                  <th className="px-4 py-4 font-bold text-center">协议签署到启动时长</th>
                  <th className="px-4 py-4 font-bold text-center">中心关闭时长</th>
                  <th className="px-4 py-4 font-bold text-center">中心是否及时关闭</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {centerDetailData.map((center, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-gray-800">{center.name}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${center.isZero3Month === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {center.isZero3Month}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${center.isZero === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {center.isZero}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${center.isTimelyStart === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {center.isTimelyStart}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.setupTime}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.ethicsTime}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.startTime}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.agreementTime}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.agreementToStartTime}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{center.closeTime}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${center.isTimelyClose === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {center.isTimelyClose}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLevel0 = () => (
    <div className="flex flex-col space-y-4 h-full overflow-hidden pb-4">
      <div className="grid grid-cols-12 gap-4 flex-shrink-0 items-stretch">
        <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start min-h-[130px]">
          <div className="w-12 h-12 bg-[#35856815] rounded-xl flex items-center justify-center text-[#358568] mr-6 flex-shrink-0 mt-1">
            <Landmark size={24} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-[#358568] font-bold text-lg mb-2">项目及时交付率</h3>
            <span className="text-gray-800 font-black text-4xl tracking-tight">{progressSummary.deliveryRate}</span>
          </div>
        </div>

        <div className="col-span-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start min-h-[130px]">
          <div className="w-12 h-12 bg-[#6366F115] rounded-xl flex items-center justify-center text-[#6366F1] mr-6 flex-shrink-0 mt-1">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#358568] font-bold text-lg h-8 flex items-center mb-2">项目进度预测</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 font-medium">
                  <th className="text-left pb-1"></th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来3月</th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来半年</th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来1年</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="group">
                  <td className="py-1.5 text-gray-500 font-medium">预测投入FTE</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[0]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[1]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[2]}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500 font-medium">预测收入</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[0]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[1]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[2]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-3">
          <KPICard label="首家伦理获批及时达成率" value={progressSummary.kpis[0]} icon={<Library size={16} />} center />
          <KPICard label="首家中心启动及时达成率" value={progressSummary.kpis[1]} icon={<Monitor size={16} />} center />
          <KPICard label="首例入组及时达成率" value={progressSummary.kpis[2]} icon={<Database size={16} />} center />
          <KPICard label="100%入组及时完成率" value={progressSummary.kpis[3]} icon={<Target size={16} />} center />
          <KPICard label="DBL及时完成率" value={progressSummary.kpis[4]} icon={<Boxes size={16} />} center />
          <KPICard label="90%中心及时关闭率" value={progressSummary.kpis[5]} icon={<Archive size={16} />} center />
        </div>
      </div>

      <div className="space-y-4 flex-1 min-h-0 flex flex-col">
        <SectionTitle title="各事业部核心进度指标" icon={<Building2 size={20} />} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#358568] text-white sticky top-0 z-10">
                <tr className="text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">临床事业部</th>
                  <th className="px-4 py-4 font-bold text-center">首家伦理获批及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">首家中心启动及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">首例入组及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">100%入组及时完成率</th>
                  <th className="px-4 py-4 font-bold text-center">DBL及时完成率</th>
                  <th className="px-4 py-4 font-bold text-center">90%中心及时关闭率</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredBUs.map((bu) => (
                  <tr 
                    key={bu.name} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (setSelectedBU) setSelectedBU(bu.name);
                      setSelectedBUs([bu.name]);
                      if (setDrillLevel) setDrillLevel(1);
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-black text-gray-800">{bu.name}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.a}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.b}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.c}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.d}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.e}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{bu.f}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#358568] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLevel1 = () => (
    <div className="flex flex-col space-y-4 h-full overflow-hidden pb-4">
      <div className="grid grid-cols-12 gap-4 flex-shrink-0 items-stretch">
        <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start min-h-[130px]">
          <div className="w-12 h-12 bg-[#35856815] rounded-xl flex items-center justify-center text-[#358568] mr-6 flex-shrink-0 mt-1">
            <Landmark size={24} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-[#358568] font-bold text-lg mb-2">项目及时交付率</h3>
            <span className="text-gray-800 font-black text-4xl tracking-tight">{progressSummary.deliveryRate}</span>
          </div>
        </div>

        <div className="col-span-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start min-h-[130px]">
          <div className="w-12 h-12 bg-[#6366F115] rounded-xl flex items-center justify-center text-[#6366F1] mr-6 flex-shrink-0 mt-1">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#358568] font-bold text-lg h-8 flex items-center mb-2">项目进度预测</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 font-medium">
                  <th className="text-left pb-1"></th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来3月</th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来半年</th>
                  <th className="text-center pb-1 uppercase tracking-tighter text-[10px]">未来1年</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="group">
                  <td className="py-1.5 text-gray-500 font-medium">预测投入FTE</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[0]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[1]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.fte[2]}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500 font-medium">预测收入</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[0]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[1]}</td>
                  <td className="py-1.5 text-center font-black text-gray-800">{progressSummary.revenue[2]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-3">
          <KPICard label="首家伦理获批及时达成率" value={progressSummary.kpis[0]} icon={<Library size={16} />} center />
          <KPICard label="首家中心启动及时达成率" value={progressSummary.kpis[1]} icon={<Monitor size={16} />} center />
          <KPICard label="首例入组及时达成率" value={progressSummary.kpis[2]} icon={<Database size={16} />} center />
          <KPICard label="100%入组及时完成率" value={progressSummary.kpis[3]} icon={<Target size={16} />} center />
          <KPICard label="DBL及时完成率" value={progressSummary.kpis[4]} icon={<Boxes size={16} />} center />
          <KPICard label="90%中心及时关闭率" value={progressSummary.kpis[5]} icon={<Archive size={16} />} center />
        </div>
      </div>

      <div className="space-y-4 flex-1 min-h-0 flex flex-col">
        <SectionTitle 
          title={`PM 核心进度指标 (${selectedBU})`} 
          icon={<Users size={20} />} 
          extra={
            <button 
              onClick={() => setDrillLevel && setDrillLevel(0)}
              className="flex items-center text-xs text-gray-400 hover:text-[#358568] transition-colors font-bold uppercase tracking-wide"
            >
              <ChevronLeft size={14} className="mr-1" /> 返回上一级
            </button>
          }
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#358568] text-white sticky top-0 z-10">
                <tr className="text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">PM 姓名</th>
                  <th className="px-4 py-4 font-bold text-center">首家伦理获批及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">首家中心启动及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">首例入组及时达成率</th>
                  <th className="px-4 py-4 font-bold text-center">100%入组及时完成率</th>
                  <th className="px-4 py-4 font-bold text-center">DBL及时完成率</th>
                  <th className="px-4 py-4 font-bold text-center">90%中心及时关闭率</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pmData.map((pm) => (
                  <tr 
                    key={pm.name} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (setSelectedPM) setSelectedPM(pm.name);
                      if (setDrillLevel) setDrillLevel(2);
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-black text-gray-800">{pm.name}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.a}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.b}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.c}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.d}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.e}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{pm.f}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#358568] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isProjectSpecific ? renderProjectLevel() : (
        <>
          {drillLevel === 0 && renderLevel0()}
          {drillLevel === 1 && renderLevel1()}
          {drillLevel === 2 && (
             <div className="flex flex-col space-y-6 h-full overflow-hidden pb-4">
               <div className="space-y-4">
                 <SectionTitle title="中心平均效率指标" icon={<Clock size={20} />} />
                 <div className="grid grid-cols-9 gap-3">
                   <KPICard label="启动后3个月后0入组中心比例" value={progressSummary.efficiency.zero3m} icon={<Users size={16} />} center />
                   <KPICard label="0入组中心比例" value={progressSummary.efficiency.zero} icon={<Users size={16} />} center />
                   <KPICard label="中心启动及时达成率" value={progressSummary.efficiency.timely} icon={<Target size={16} />} center />
                   <KPICard label="中心立项平均时长" value={progressSummary.efficiency.setup} icon={<Clock size={16} />} center />
                   <KPICard label="中心伦理平均时长" value={progressSummary.efficiency.ethics} icon={<Monitor size={16} />} center />
                   <KPICard 
                     label="中心启动平均时长" 
                     value={progressSummary.efficiency.start} 
                     icon={<Database size={16} />} 
                     center 
                     className="col-span-2"
                     subValue={`中心协议签署平均时长 ${progressSummary.efficiency.agreement}\n协议签署到启动平均时长 ${progressSummary.efficiency.agreementToStart}`}
                   />
                   <KPICard label="中心关闭平均时长" value={progressSummary.efficiency.close} icon={<Archive size={16} />} center />
                   <KPICard label="中心及时关闭率" value={progressSummary.efficiency.timelyClose} icon={<CheckCircle2 size={16} />} center />
                 </div>
               </div>
               <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                 <SectionTitle 
                   title={`项目进度详情 (${selectedPM})`} 
                   icon={<Building2 size={20} />} 
                   extra={
                     <button 
                       onClick={() => setDrillLevel && setDrillLevel(1)}
                       className="flex items-center text-xs text-gray-400 hover:text-[#358568] transition-colors font-bold uppercase tracking-wide"
                     >
                       <ChevronLeft size={14} className="mr-1" /> 返回上一级
                     </button>
                   }
                 />
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
                   <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-left border-collapse min-w-[1200px]">
                       <thead className="bg-[#358568] text-white sticky top-0 z-10">
                         <tr className="text-[11px] uppercase tracking-wider">
                           <th className="px-6 py-4 font-bold">项目名称</th>
                           <th className="px-4 py-4 font-bold text-center">启动3个月后是否0入组</th>
                           <th className="px-4 py-4 font-bold text-center">是否0入组</th>
                           <th className="px-4 py-4 font-bold text-center">中心是否及时启动</th>
                           <th className="px-4 py-4 font-bold text-center">中心立项时长</th>
                           <th className="px-4 py-4 font-bold text-center">中心伦理时长</th>
                           <th className="px-4 py-4 font-bold text-center">中心启动时长</th>
                           <th className="px-4 py-4 font-bold text-center">中心协议签署时长</th>
                           <th className="px-4 py-4 font-bold text-center">协议签署到启动时长</th>
                           <th className="px-4 py-4 font-bold text-center">中心关闭时长</th>
                           <th className="px-4 py-4 font-bold text-center">中心是否及时关闭</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 bg-white">
                         {filteredProjects.map((proj) => (
                           <tr key={proj.name} className="hover:bg-gray-50 transition-colors group">
                             <td className="px-6 py-4 text-sm font-black text-gray-800">{proj.name}</td>
                             <td className="px-4 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${proj.isZero3Month === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                 {proj.isZero3Month}
                               </span>
                             </td>
                             <td className="px-4 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${proj.isZero === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                 {proj.isZero}
                               </span>
                             </td>
                             <td className="px-4 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${proj.isTimelyStart === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                 {proj.isTimelyStart}
                               </span>
                             </td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.setup}</td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.ethics}</td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.start}</td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.agreement}</td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.agreementToStart}</td>
                             <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{proj.close}</td>
                             <td className="px-4 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${proj.isTimelyClose === '是' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                 {proj.isTimelyClose}
                               </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
             </div>
          )}
        </>
      )}
    </>
  );
};

const FinancialAnalysis: React.FC<{ selectedMonth: string; selectedBUs: string[]; selectedProjects: string[]; setSelectedProjects?: (ps: string[]) => void; setActiveTab?: (tab: ProjectSubView) => void }> = ({ selectedMonth, selectedBUs, selectedProjects, setSelectedProjects, setActiveTab }) => {
  const [profitFilter, setProfitFilter] = useState<'汇总' | '服务费' | '过手费'>('汇总');

  const isProjectSpecific = selectedProjects.length === 1;

  const filterSeed = useMemo(() => {
    return selectedMonth + (selectedBUs.join('|')) + (selectedProjects.join('|'));
  }, [selectedMonth, selectedBUs, selectedProjects]);

  const deriveVal = (base: number, variance: number, subSeed: string) => {
    const combined = filterSeed + subSeed;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = (Math.abs(hash) % 100) / 100;
    return base + (rand * variance * 2 - variance);
  };

  const formatT = (num: number) => Math.round(num).toLocaleString('zh-CN');

  const filteredMonths = useMemo(() => {
    const year = selectedMonth.substring(0, 4);
    return MONTHS.filter(m => m.startsWith(year) && m <= selectedMonth);
  }, [selectedMonth]);

  const stages = ['准备', '启动', '入组', '随访', '数据清理', '完成', '关闭'];

  const stageData = useMemo(() => stages.map(s => ({
    name: s,
    revenue: Math.round(deriveVal(100, 40, s + 'rev')),
    growth: Math.round(deriveVal(10, 15, s + 'gr')),
    receivable: Math.round(deriveVal(80, 30, s + 'rec')),
    collection: Math.round(deriveVal(60, 30, s + 'col'))
  })), [filterSeed]);

  const costTrendData = useMemo(() => filteredMonths.map(m => ({
    name: m,
    cost: Math.round(deriveVal(80, 30, m + 'cost')),
    growth: Math.round(deriveVal(10, 10, m + 'cgr'))
  })), [filteredMonths, filterSeed]);

  const profitTrendData = useMemo(() => filteredMonths.map(m => ({
    name: m,
    profit: Math.round(deriveVal(40, 20, m + 'prof')),
    margin: Math.round(deriveVal(40, 15, m + 'marg'))
  })), [filteredMonths, profitFilter, filterSeed]);

  const arCollectionTrendData = useMemo(() => filteredMonths.map(m => ({
    name: m,
    receivable: Math.round(deriveVal(200, 80, m + 'arc_rec')),
    collection: Math.round(deriveVal(150, 70, m + 'arc_col')),
    rate: Math.round(deriveVal(75, 15, m + 'arc_rate'))
  })), [filteredMonths, filterSeed]);

  const arDistribution = useMemo(() => [
    { name: '信用期内应收款', value: Math.round(deriveVal(500, 100, 'ard1')), percentage: '55%' },
    { name: '已达节点未开票', value: Math.round(deriveVal(250, 80, 'ard2')), percentage: '30%' },
    { name: '逾期应收款', value: Math.round(deriveVal(150, 60, 'ard3')), percentage: '15%' }
  ], [filterSeed]);

  const financialProjectData = useMemo(() => {
    const projectNames = [
      '鸿运华宁-GMA102', '万泰生物-WT-021', '君实生物-JS001', '康希诺-CN-09', '信达生物-IBI306',
      '恒瑞-SH-0911', '君实-JS-002', '复星医药-FS001', '药明生物-WXB-902', '齐鲁制药-QL-902'
    ];
    
    return projectNames.map(name => ({
      name,
      revenue: Math.round(deriveVal(120, 40, name + 'rev')),
      cost: Math.round(deriveVal(80, 30, name + 'cost')),
      gp: Math.round(deriveVal(40, 20, name + 'gp')),
      margin: (25 + Math.random() * 20).toFixed(1) + '%',
      ar: Math.round(deriveVal(50, 20, name + 'ar')),
      collection: Math.round(deriveVal(40, 15, name + 'col')),
      rate: (70 + Math.random() * 25).toFixed(1) + '%'
    }));
  }, [filterSeed]);

  const filteredFinancialProjects = useMemo(() => {
    if (selectedProjects.length === 0) return financialProjectData;
    return financialProjectData.filter(p => selectedProjects.includes(p.name));
  }, [selectedProjects, financialProjectData]);

  const kpiData = useMemo(() => {
    const revenue = deriveVal(1336, 100, 'rev_main');
    const cost = deriveVal(980, 80, 'cost_main');
    const gp = deriveVal(356, 50, 'gp_main');
    const margin = deriveVal(38.65, 5, 'margin_main');
    const roi = deriveVal(0.87, 0.1, 'roi_main');
    const ar = deriveVal(238, 40, 'ar_main');
    const collection = deriveVal(209, 30, 'coll_main');
    const collRate = deriveVal(82.40, 5, 'rate_main');

    return {
      revenue: Math.round(revenue),
      revenueGrowth: deriveVal(2.96, 1, 'rev_gr').toFixed(2),
      cost: Math.round(cost),
      costGrowth: deriveVal(4.56, 1, 'cost_gr').toFixed(2),
      gp: Math.round(gp),
      gpService: Math.round(deriveVal(278, 40, 'gp_svc')),
      gpPass: Math.round(deriveVal(78, 20, 'gp_pass')),
      margin: margin.toFixed(2),
      marginService: deriveVal(27.6, 5, 'marg_svc').toFixed(1),
      marginPass: deriveVal(29.3, 5, 'marg_pass').toFixed(1),
      roi: roi.toFixed(2),
      ar: Math.round(ar),
      arOverdue: Math.round(deriveVal(48, 15, 'ar_over')),
      arUnbilled: Math.round(deriveVal(76, 20, 'ar_unb')),
      arCredit: Math.round(deriveVal(114, 30, 'ar_cred')),
      collection: Math.round(collection),
      collRate: collRate.toFixed(2)
    };
  }, [filterSeed]);

  const renderBlackLegendText = (value: string) => <span className="text-[#358568] text-[10px] ml-1">{value}</span>;

  const getProfitLegendNames = () => {
    if (profitFilter === '服务费') return { bar: "服务费毛利润", line: "服务费毛利率" };
    if (profitFilter === '过手费') return { bar: "过手费毛利润", line: "服务费毛利率" };
    return { bar: "毛利润", line: "毛利率" };
  };

  const profitLegends = getProfitLegendNames();

  const tooltipFormatter = (value: any, name: string) => {
    if (typeof value === 'number') {
      const isRatio = name.includes('率') || name.includes('Margin') || name.includes('Growth');
      return isRatio ? [`${value}%`, name] : [`${value} 万元`, name];
    }
    return [value, name];
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden">
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {/* Card 1: 项目营收 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">项目营收</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-900">项目收入</span>
                <span className="text-base font-black text-gray-900">{formatT(kpiData.revenue)}万元</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>同比:</span>
                <span className="text-black font-bold">▲{kpiData.revenueGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-900">项目成本</span>
                <span className="text-base font-black text-gray-900">{formatT(kpiData.cost)}万元</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>同比:</span>
                <span className="text-black font-bold">▽{kpiData.costGrowth}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 项目毛利润 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">项目毛利润</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-900">毛利润</span>
              <span className="text-base font-black text-gray-900">{formatT(kpiData.gp)}万元</span>
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>服务费毛利润:</span>
                <span className="text-black font-bold">{formatT(kpiData.gpService)}万元</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>过手费毛利润:</span>
                <span className="text-black font-bold">{formatT(kpiData.gpPass)}万元</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: 项目毛利率 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">项目毛利率</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-900">毛利率</span>
              <span className="text-base font-black text-gray-900">{kpiData.margin}%</span>
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>服务费毛利率:</span>
                <span className="text-black font-bold">{kpiData.marginService}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>过手费毛利率:</span>
                <span className="text-black font-bold">{kpiData.marginPass}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: 投入产出比 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">投入产出比</h3>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-3xl font-black text-gray-900">{kpiData.roi}</span>
          </div>
        </div>

        {/* Card 5: 项目营收款 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">项目营收款</h3>
            <span className="text-xl font-black text-gray-900">{formatT(kpiData.ar)}万元</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>逾期应收账款:</span>
                <span className="text-black font-bold">{formatT(kpiData.arOverdue)}万元</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>未开票应收账款:</span>
                <span className="text-black font-bold">{formatT(kpiData.arUnbilled)}万元</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>信用期内应收账款:</span>
              <span className="text-black font-bold">{formatT(kpiData.arCredit)}万元</span>
            </div>
          </div>
        </div>

        {/* Card 6: 项目回款 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">项目回款</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-900">回款金额</span>
              <span className="text-base font-black text-gray-900">{formatT(kpiData.collection)}万</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-900">回款率</span>
              <span className="text-base font-black text-gray-900">{kpiData.collRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {isProjectSpecific ? (
        <>
          <div className="grid grid-cols-3 gap-3 h-[28%] min-h-[200px]">
            <DashboardModule title="项目各阶段项目收入分析" icon={<BarChart3 size={18} />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stageData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="项目收入" fill="#358568" barSize={16} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" name="同比增长" stroke="#B1D996" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </DashboardModule>

            <DashboardModule title="各月份项目成本趋势" icon={<TrendingUp size={18} />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={costTrendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                  <Bar yAxisId="left" dataKey="cost" name="项目成本" fill="#358568" barSize={16} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" name="同比增长" stroke="#B1D996" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </DashboardModule>

            <DashboardModule 
              title="各月份利润趋势" 
              icon={<Zap size={18} />} 
              extra={
                <div className="flex bg-gray-50 rounded-full p-0.5 text-[9px] border border-gray-100 shadow-inner">
                  {(['汇总', '服务费', '过手费'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setProfitFilter(f)} 
                      className={`px-3 py-1 rounded-full transition-all duration-200 ${profitFilter === f ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >{f}</button>
                  ))}
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitTrendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                  <Bar yAxisId="left" dataKey="profit" name={profitLegends.bar} fill="#358568" barSize={16} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" name={profitLegends.line} stroke="#B1D996" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </DashboardModule>
          </div>

          <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
            <DashboardModule title="不同应收账款类型分布析" className="col-span-4" icon={<PieChartIcon size={18} />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={arDistribution} 
                    cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value"
                  >
                    {arDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#358568" : index === 1 ? "#7ABFAD" : "#B1D996"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} 万元`, name]} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </DashboardModule>

            <DashboardModule title="应收与回款情况月度趋势" className="col-span-8" icon={<Coins size={18} />}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={arCollectionTrendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                  <Bar yAxisId="left" dataKey="receivable" name="每月应收账款" fill="#358568" barSize={14} radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="collection" name="每月回款金额" fill="#7ABFAD" barSize={14} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" name="回款率" stroke="#B1D996" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </DashboardModule>
          </div>
        </>
      ) : (
        <DashboardModule title="项目财务概览" className="flex-1 min-h-0" icon={<DollarSign size={18} />}>
          <div className="h-full flex flex-col">
            <div className="overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-[#358568] text-white sticky top-0 z-10">
                  <tr className="text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">项目名称</th>
                    <th className="px-4 py-4 font-bold text-center">项目收入 (万元)</th>
                    <th className="px-4 py-4 font-bold text-center">项目成本 (万元)</th>
                    <th className="px-4 py-4 font-bold text-center">毛利润 (万元)</th>
                    <th className="px-4 py-4 font-bold text-center">毛利率</th>
                    <th className="px-4 py-4 font-bold text-center">应收账款 (万元)</th>
                    <th className="px-4 py-4 font-bold text-center">回款金额 (万元)</th>
                    <th className="px-4 py-4 font-bold text-center">回款率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredFinancialProjects.map((p, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (setSelectedProjects) setSelectedProjects([p.name]);
                        if (setActiveTab) setActiveTab('Financial');
                      }}
                    >
                      <td className="px-6 py-4 text-xs font-bold text-gray-800 group-hover:text-[#358568] transition-colors">{p.name}</td>
                      <td className="px-4 py-4 text-center text-sm font-black text-gray-800">{p.revenue}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{p.cost}</td>
                      <td className="px-4 py-4 text-center text-sm font-black text-[#358568]">{p.gp}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{p.margin}</td>
                      <td className="px-4 py-4 text-center text-sm font-black text-gray-800">{p.ar}</td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-600">{p.collection}</td>
                      <td className="px-4 py-4 text-center text-sm font-black text-[#358568]">{p.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DashboardModule>
      )}
    </div>
  );
};

const QualityAnalysis: React.FC<{ 
  selectedMonth: string; 
  selectedBUs: string[]; 
  selectedProjects: string[];
  setSelectedProjects?: (ps: string[]) => void;
  setActiveTab?: (tab: ProjectSubView) => void;
  setActiveView?: (view: DashboardView) => void;
}> = ({ selectedMonth, selectedBUs, selectedProjects, setSelectedProjects, setActiveTab, setActiveView }) => {
  const [monitoringType, setMonitoringType] = useState<'submit' | 'finalize'>('submit');
  const [ipdType, setIpdType] = useState<'discovery' | 'report'>('discovery');
  const [tmfType, setTmfType] = useState<'completeness' | 'archival' | 'qc'>('completeness');

  const isProjectSpecific = selectedProjects.length === 1;

  const filterSeed = useMemo(() => {
    return selectedMonth + (selectedBUs.join('|')) + (selectedProjects.join('|'));
  }, [selectedMonth, selectedBUs, selectedProjects]);

  const deriveVal = (base: number, variance: number, subSeed: string) => {
    const combined = filterSeed + subSeed;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = (Math.abs(hash) % 100) / 100;
    return base + (rand * variance * 2 - variance);
  };

  const getIpdReportTarget = () => {
    const primaryBU = selectedBUs.length === 1 ? selectedBUs[0] : (selectedBUs.length === 0 || selectedBUs.length === BUS.length ? 'ALL' : selectedBUs[0]);
    if (primaryBU === 'COBU') return 90;
    if (primaryBU === 'ECO') return 85;
    if (primaryBU === 'VPMS' || primaryBU === 'IBU') return 80;
    return 85; 
  };

  const qualityProjectData = useMemo(() => {
    const projectNames = [
      '鸿运华宁-GMA102', '万泰生物-WT-021', '君实生物-JS001', '康希诺-CN-09', '信达生物-IBI306',
      '恒瑞-SH-0911', '君实-JS-002', '复星医药-FS001', '药明生物-WXB-902', '齐鲁制药-QL-902'
    ];
    
    return projectNames.map(name => ({
      name,
      submitRate: (92 + Math.random() * 6).toFixed(1) + '%',
      finalizeRate: (91 + Math.random() * 7).toFixed(1) + '%',
      saeRate: (93 + Math.random() * 5).toFixed(1) + '%',
      enrollment: Math.floor(100 + Math.random() * 500),
      ipdCount: Math.floor(50 + Math.random() * 200),
      ipdOccurrence: (75 + Math.random() * 15).toFixed(1) + '%',
      ipdDiscovery: (60 + Math.random() * 20).toFixed(1) + '%',
      ipdReport: (85 + Math.random() * 10).toFixed(1) + '%',
      capaRate: (90 + Math.random() * 8).toFixed(1) + '%',
      pdCaseRate: (1.5 + Math.random() * 2).toFixed(1) + '%',
      pdVisitRate: (0.5 + Math.random() * 1).toFixed(1) + '%',
      tmfCompleteness: (94 + Math.random() * 5).toFixed(1) + '%',
      tmfArchival: (85 + Math.random() * 10).toFixed(1) + '%',
      tmfQC: (92 + Math.random() * 6).toFixed(1) + '%'
    }));
  }, [filterSeed]);

  const filteredQualityProjects = useMemo(() => {
    if (selectedProjects.length === 0) return qualityProjectData;
    return qualityProjectData.filter(p => selectedProjects.includes(p.name));
  }, [selectedProjects, qualityProjectData]);

  const trendData = useMemo(() => {
    const currentYear = selectedMonth.substring(0, 4);
    const monthsToShow = MONTHS.filter(m => m.startsWith(currentYear) && m <= selectedMonth);
    
    return monthsToShow.map((m, i) => {
      const monthSeed = m + filterSeed;
      let mSubmit = deriveVal(96, 2, monthSeed + 'ms');
      let mFinalize = deriveVal(95, 2, monthSeed + 'mf');
      let sae = deriveVal(94, 2, monthSeed + 'sae');
      let ipdD = deriveVal(68, 5, monthSeed + 'ipdd');
      let ipdR = deriveVal(89, 4, monthSeed + 'ipdr');
      let capa = deriveVal(94, 3, monthSeed + 'capa');
      let tmfc = deriveVal(95, 2, monthSeed + 'tmfc');
      let tmfa = deriveVal(88, 3, monthSeed + 'tmfa');
      let tmfq = deriveVal(94, 3, monthSeed + 'tmfq');
      const ipdR_target = getIpdReportTarget();
      if (monthsToShow.length > 0) {
        if (i === monthsToShow.length - 2 || i === 1) mSubmit = 88.5;
        if (i === 0) mFinalize = 89.2;
        if (i === 2) sae = 87.5;
        if (i === 3) ipdD = 55.0;
        if (i === 4) ipdR = ipdR_target - 2;
        if (i === 1) capa = 86.4;
        if (i === monthsToShow.length - 1) tmfc = 89.8;
        if (i === 2) tmfa = 83.2;
        if (i === 0) tmfq = 87.1;
      }
      return { name: m, monitoringSubmit: mSubmit, monitoringFinalize: mFinalize, saeRate: sae, ipdDiscovery: ipdD, ipdReport: ipdR, capaRate: capa, tmfCompleteness: tmfc, tmfArchival: tmfa, tmfQC: tmfq };
    });
  }, [selectedMonth, filterSeed]);

  const renderBlackLegendText = (value: string) => <span className="text-[#358568] text-[10px] ml-1">{value}</span>;
  const BAD_RED = '#FF8080';

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      <div className="grid grid-cols-6 gap-3 flex-shrink-0">
        <MultiKPICard 
          title="中心监查报告" 
          indicators={[
            { label: isProjectSpecific ? '中心监查报告及时提交率' : '中心监查报告及时提交达成项目数量占比', value: '95.9%' }, 
            { label: isProjectSpecific ? '中心监查报告及时定稿率' : '中心监查报告及时定稿达成项目数量占比', value: '94.6%' }
          ]} 
          icon={<FileText size={18} />} 
        />
        <MultiKPICard title="SAE报告" indicators={[{ label: isProjectSpecific ? 'SAE及时报告率' : 'SAE及时报告达成项目数量占比', value: deriveVal(94, 2, 'kpi_sae').toFixed(1) + '%' }]} icon={<Zap size={18} />} alignToSlot={1} />
        <MultiKPICard 
          title="IPD管理" 
          className="col-span-2"
          columns={2}
          indicators={[
            { label: '项目数量', value: '105' },
            { label: 'IPD发生率', value: '80.3%' },
            { label: '入组例数', value: '1200' },
            { label: isProjectSpecific ? 'IPD及时发现率' : 'IPD及时发现达成项目数量占比', value: '66.2%' },
            { label: 'IPD数量', value: '980' },
            { label: isProjectSpecific ? 'IPD及时报告率' : 'IPD及时报告达成项目数量占比', value: '87.8%' }
          ]} 
          icon={<Layers size={18} />} 
        />
        <MultiKPICard title="CAPA执行" indicators={[{ label: isProjectSpecific ? 'CAPA执行及时完成率' : 'CAPA执行及时完成达成项目数量占比', value: deriveVal(94, 1, 'kpi_capa').toFixed(1) + '%' }]} icon={<CheckCircle2 size={18} />} alignToSlot={1} />
        <MultiKPICard title="TMF管理" indicators={[
          { label: isProjectSpecific ? 'TMF完整性' : 'TMF完整性达成项目数量占比', value: deriveVal(96, 1, 'kpi_tmfc').toFixed(1) + '%' }, 
          { label: isProjectSpecific ? 'TMF归档及时率' : 'TMF及时归档达成项目数量占比', value: deriveVal(91, 2, 'kpi_tmfa').toFixed(1) + '%' }, 
          { label: isProjectSpecific ? 'TMF QC 完成率' : 'TMF QC完成率达成项目数量占比', value: deriveVal(95, 1, 'kpi_tmfq').toFixed(1) + '%' }
        ]} icon={<Library size={18} />} />
      </div>
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        {isProjectSpecific ? (
          <>
            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
              <DashboardModule title="中心监查报告" icon={<Monitor size={18} />} extra={
                <div className="flex bg-gray-50 rounded-full p-0.5 text-[9px] border border-gray-100 shadow-inner">
                  <button onClick={() => setMonitoringType('submit')} className={`px-3 py-1 rounded-full transition-all duration-200 ${monitoringType === 'submit' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>及时提交率</button>
                  <button onClick={() => setMonitoringType('finalize')} className={`px-3 py-1 rounded-full transition-all duration-200 ${monitoringType === 'finalize' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>及时定稿率</button>
                </div>
              }>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, monitoringType === 'submit' ? '中心监查报告及时提交率' : '中心监查报告及时定稿率']} />
                    <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                    <Bar dataKey={monitoringType === 'submit' ? 'monitoringSubmit' : 'monitoringFinalize'} name={monitoringType === 'submit' ? '中心监查报告及时提交率' : '中心监查报告及时定稿率'} barSize={20} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => {
                        const key = monitoringType === 'submit' ? 'monitoringSubmit' : 'monitoringFinalize';
                        const val = entry[key as keyof typeof entry] as number;
                        return <Cell key={`cell-${index}`} fill={val >= 90 ? '#358568' : BAD_RED} />;
                      })}
                    </Bar>
                    <ReferenceLine y={90} stroke={BAD_RED} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardModule>
              <DashboardModule title="SAE及时报告率" icon={<AlertCircle size={18} />}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'SAE及时报告率']} />
                    <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                    <Bar dataKey="saeRate" name="SAE及时报告率" barSize={20} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => {
                        const val = entry.saeRate as number;
                        return <Cell key={`cell-${index}`} fill={val >= 90 ? '#358568' : BAD_RED} />;
                      })}
                    </Bar>
                    <ReferenceLine y={90} stroke={BAD_RED} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardModule>
              <DashboardModule title="IPD管理" icon={<Database size={18} />} extra={
                <div className="flex bg-gray-50 rounded-full p-0.5 text-[9px] border border-gray-100 shadow-inner">
                  <button onClick={() => setIpdType('discovery')} className={`px-3 py-1 rounded-full transition-all duration-200 ${ipdType === 'discovery' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>及时发现率</button>
                  <button onClick={() => setIpdType('report')} className={`px-3 py-1 rounded-full transition-all duration-200 ${ipdType === 'report' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>及时报告率</button>
                </div>
              }>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, ipdType === 'discovery' ? 'IPD及时发现率' : 'IPD及时报告率']} />
                    <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                    <Bar dataKey={ipdType === 'discovery' ? 'ipdDiscovery' : 'ipdReport'} name={ipdType === 'discovery' ? 'IPD及时发现率' : 'IPD及时报告率'} barSize={20} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => {
                        const key = ipdType === 'discovery' ? 'ipdDiscovery' : 'ipdReport';
                        const val = entry[key as keyof typeof entry] as number;
                        const target = ipdType === 'discovery' ? 60 : getIpdReportTarget();
                        return <Cell key={`cell-${index}`} fill={val >= target ? '#358568' : BAD_RED} />;
                      })}
                    </Bar>
                    <ReferenceLine y={ipdType === 'discovery' ? 60 : getIpdReportTarget()} stroke={BAD_RED} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardModule>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
              <DashboardModule title="CAPA执行及时完成率" icon={<CheckCircle2 size={18} />}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'CAPA执行及时完成率']} />
                    <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                    <Bar dataKey="capaRate" name="CAPA执行及时完成率" barSize={20} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => {
                        const val = entry.saeRate as number;
                        return <Cell key={`cell-${index}`} fill={val >= 90 ? '#358568' : BAD_RED} />;
                      })}
                    </Bar>
                    <ReferenceLine y={90} stroke={BAD_RED} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardModule>
              <DashboardModule title="TMF管理" icon={<Library size={18} />} extra={
                <div className="flex bg-gray-50 rounded-full p-0.5 text-[9px] border border-gray-100 shadow-inner">
                  <button onClick={() => setTmfType('completeness')} className={`px-3 py-1 rounded-full transition-all duration-200 ${tmfType === 'completeness' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>TMF完整性</button>
                  <button onClick={() => setTmfType('archival')} className={`px-3 py-1 rounded-full transition-all duration-200 ${tmfType === 'archival' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>归档及时率</button>
                  <button onClick={() => setTmfType('qc')} className={`px-3 py-1 rounded-full transition-all duration-200 ${tmfType === 'qc' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>QC完成率</button>
                </div>
              }>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 30, bottom: 20, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, tmfType === 'completeness' ? 'TMF完整性' : tmfType === 'archival' ? 'TMF归档及时率' : 'TMF QC完成率']} />
                    <Legend verticalAlign="top" align="center" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9, top: -10 }} />
                    <Bar dataKey={tmfType === 'completeness' ? 'tmfCompleteness' : tmfType === 'archival' ? 'tmfArchival' : 'tmfQC'} name={tmfType === 'completeness' ? 'TMF完整性' : tmfType === 'archival' ? 'TMF归档及时率' : 'TMF QC完成率'} barSize={20} radius={[2, 2, 0, 0]}>
                      {trendData.map((entry, index) => {
                        const key = tmfType === 'completeness' ? 'tmfCompleteness' : tmfType === 'archival' ? 'tmfArchival' : 'tmfQC';
                        const val = entry[key as keyof typeof entry] as number;
                        const target = tmfType === 'archival' ? 85 : 90;
                        return <Cell key={`cell-${index}`} fill={val >= target ? '#358568' : BAD_RED} />;
                      })}
                    </Bar>
                    <ReferenceLine y={tmfType === 'archival' ? 85 : 90} stroke={BAD_RED} strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </DashboardModule>
              <DashboardModule title="IPD未解决占比" icon={<PieChartIcon size={18} />}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                        { name: '≤60days', value: 45 }, 
                        { name: '60~90days', value: 25 }, 
                        { name: '90~120days', value: 20 }, 
                        { name: '≥120days', value: 10 }
                      ]} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50} 
                      outerRadius={75} 
                      paddingAngle={2} 
                      dataKey="value"
                    >
                      <Cell fill="#358568" />
                      <Cell fill="#5A9E85" />
                      <Cell fill="#7ABFAD" />
                      <Cell fill="#A8D5C9" />
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </DashboardModule>
            </div>
          </>
        ) : (
          <DashboardModule title="项目质量概览" className="flex-1 min-h-0" icon={<ClipboardCheck size={18} />}>
            <div className="h-full flex flex-col">
              <div className="overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl flex-1">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead className="bg-[#358568] text-white sticky top-0 z-10">
                    <tr className="text-[10px] uppercase tracking-wider">
                      <th className="px-4 py-3 font-bold">项目名称</th>
                      <th className="px-2 py-3 font-bold text-center">中心监查报告<br/>及时提交率</th>
                      <th className="px-2 py-3 font-bold text-center">中心监查报告<br/>及时定稿率</th>
                      <th className="px-2 py-3 font-bold text-center">SAE及时报告率</th>
                      <th className="px-2 py-3 font-bold text-center">入组例数</th>
                      <th className="px-2 py-3 font-bold text-center">IPD数量</th>
                      <th className="px-2 py-3 font-bold text-center">IPD发生率</th>
                      <th className="px-2 py-3 font-bold text-center">IPD及时发现率</th>
                      <th className="px-2 py-3 font-bold text-center">IPD及时报告率</th>
                      <th className="px-2 py-3 font-bold text-center">PD 发生率<br/>(按病例数)</th>
                      <th className="px-2 py-3 font-bold text-center">PD 发生率<br/>(按病例访视数)</th>
                      <th className="px-2 py-3 font-bold text-center">CAPA执行<br/>及时完成率</th>
                      <th className="px-2 py-3 font-bold text-center">TMF完整性</th>
                      <th className="px-2 py-3 font-bold text-center">TMF归档及时率</th>
                      <th className="px-2 py-3 font-bold text-center">TMF QC完成率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredQualityProjects.map((p, idx) => {
                      const getRateColor = (valStr: string, threshold: number) => {
                        const val = parseFloat(valStr);
                        return val < threshold ? 'text-red-500 font-bold' : 'text-gray-800';
                      };

                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (setSelectedProjects) setSelectedProjects([p.name]);
                            if (setActiveTab) setActiveTab('Quality');
                            if (setActiveView) setActiveView('ProjectDetail');
                          }}
                        >
                          <td className="px-4 py-3 text-xs font-bold text-gray-800 group-hover:text-[#358568] transition-colors">{p.name}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.submitRate, 95)}`}>{p.submitRate}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.finalizeRate, 95)}`}>{p.finalizeRate}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.saeRate, 90)}`}>{p.saeRate}</td>
                          <td className="px-2 py-3 text-center text-[11px] font-black text-gray-800">{p.enrollment}</td>
                          <td className="px-2 py-3 text-center text-[11px] font-black text-gray-800">{p.ipdCount}</td>
                          <td className="px-2 py-3 text-center text-[11px] font-medium text-gray-600">{p.ipdOccurrence}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.ipdDiscovery, 60)}`}>{p.ipdDiscovery}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.ipdReport, 80)}`}>{p.ipdReport}</td>
                          <td className="px-2 py-3 text-center text-[11px] font-medium text-gray-600">{p.pdCaseRate}</td>
                          <td className="px-2 py-3 text-center text-[11px] font-medium text-gray-600">{p.pdVisitRate}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.capaRate, 90)}`}>{p.capaRate}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.tmfCompleteness, 90)}`}>{p.tmfCompleteness}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.tmfArchival, 85)}`}>{p.tmfArchival}</td>
                          <td className={`px-2 py-3 text-center text-[11px] ${getRateColor(p.tmfQC, 90)}`}>{p.tmfQC}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </DashboardModule>
        )}
      </div>
    </div>
  );
};


export default ProjectDetail;
