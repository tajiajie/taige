
import React, { useState, useRef, useEffect } from 'react';
import { ICONS, BUS, MONTHS, LOGO_URL } from '../constants';
import { DashboardView, ProjectSubView, UserRole } from '../types';
import { LogOut, Check, ChevronDown, Package, UserCircle, LayoutGrid, Activity, TrendingUp, AlertCircle, DollarSign, Users, ChevronDown as ChevronDownIcon, ChevronRight as ChevronRightIcon, ClipboardCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedBUs: string[];
  setSelectedBUs: (bus: string[]) => void;
  selectedProjects: string[];
  setSelectedProjects: (ps: string[]) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  progressDrillLevel?: number;
  projectDetailTab?: ProjectSubView;
}

const PROJECT_BU_MAP: Record<string, string> = {
  "鸿运华宁-GMA102": "COBU",
  "万泰生物-WT-021": "COBU",
  "君实生物-JS001": "COBU",
  "康希诺-CN-09": "COBU",
  "信达生物-IBI306": "COBU",
  "恒瑞-SH-0911": "COBU",
  "君实-JS-002": "COBU",
  "复星医药-FS001": "ECO",
  "药明生物-WXB-902": "ECO",
  "齐鲁制药-QL-902": "ECO",
  "恒瑞医药-HR092": "ECO",
  "信立泰-S001": "ECO",
  "正大天晴-CTT-082": "VPMS",
  "长春高新-CHH-001": "VPMS",
  "贝达药业-BD-022": "VPMS",
  "百济神州-BG-001": "IBU",
  "辉瑞-PFE-001": "IBU",
  "罗氏-RO-002": "IBU",
  "默沙东-MSD-003": "IBU"
};

const ALL_PROJECTS = Object.keys(PROJECT_BU_MAP);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView,
  selectedMonth,
  setSelectedMonth,
  selectedBUs,
  setSelectedBUs,
  selectedProjects,
  setSelectedProjects,
  userRole,
  setUserRole,
  progressDrillLevel = 0,
  projectDetailTab = 'Progress'
}) => {
  const [isBUOpen, setIsBUOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isOperationExpanded, setIsOperationExpanded] = useState(true);

  const buRef = useRef<HTMLDivElement>(null);
  const projRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buRef.current && !buRef.current.contains(event.target as Node)) setIsBUOpen(false);
      if (projRef.current && !projRef.current.contains(event.target as Node)) setIsProjOpen(false);
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) setIsRoleOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFinancialView = activeView === 'Financial';
  const isProgressView = activeView === 'Progress';
  const isQualityView = activeView === 'Quality';
  const isEnrollmentView = activeView === 'ProjectDetail';
  const isProjectSpecific = selectedProjects.length === 1;
  const currentProjName = selectedProjects[0];

  const toggleBU = (bu: string) => {
    let newBUs: string[];
    if (isFinancialView || isQualityView || (isProgressView && progressDrillLevel > 0)) {
      newBUs = [bu];
      setIsBUOpen(false);
    } else {
      if (selectedBUs.includes(bu)) {
        newBUs = selectedBUs.filter(b => b !== bu);
      } else {
        newBUs = [...selectedBUs, bu];
      }
    }
    setSelectedBUs(newBUs);
    
    if (newBUs.length === BUS.length || newBUs.length === 0) {
      if (!isProgressView && !isEnrollmentView) setSelectedProjects([]);
    } else {
      const validProjects = selectedProjects.filter(p => newBUs.includes(PROJECT_BU_MAP[p]));
      if (!isProgressView && !isEnrollmentView) setSelectedProjects(validProjects);
    }
  };

  const selectAllBUs = () => {
    if (isFinancialView || isQualityView || (isProgressView && progressDrillLevel > 0)) return;
    const isFull = selectedBUs.length === BUS.length;
    if (isFull) {
      setSelectedBUs([]);
      setSelectedProjects([]);
    } else {
      setSelectedBUs([...BUS]);
      setSelectedProjects([]);
    }
  };

  const toggleProj = (proj: string) => {
    const newProjs = selectedProjects.includes(proj)
      ? selectedProjects.filter(p => p !== proj)
      : [...selectedProjects, proj];
    setSelectedProjects(newProjs);
  };

  const roles: UserRole[] = ['BU head', 'DO', 'PM'];

  const showProjectFilter = activeView !== 'Overview' && activeView !== 'Operation' && activeView !== 'Icons' && !(isProgressView && progressDrillLevel < 2);
  const showRoleSwitcher = activeView !== 'Operation' && activeView !== 'Quality' && activeView !== 'Overview' && activeView !== 'Icons' && activeView !== 'ProjectDetail' && activeView !== 'Financial';

  // Per user request: Remove BU filter for project details hub
  const showBUFilter = activeView !== 'Overview' && activeView !== 'Icons' && activeView !== 'ProjectDetail';

  const getPageTitle = () => {
    if (activeView === 'Overview') return '泰格项目领导驾驶舱';
    if (activeView === 'Operation') return '部门运营看板';
    if (activeView === 'Icons') return '图标资源库';

    if (activeView === 'ProjectDetail') {
      const tabName = projectDetailTab === 'Progress' ? '进度分析' : projectDetailTab === 'Quality' ? '质量分析' : '财务分析';
      return isProjectSpecific ? `${currentProjName} ${tabName}` : `项目明细 ${tabName}`;
    }

    const suffix = activeView === 'Progress' ? '进度分析' : activeView === 'Quality' ? '质量分析' : '财务分析';
    if (isProjectSpecific) {
      return `${currentProjName} ${suffix}`;
    }

    if (activeView === 'Progress') return '项目进度分析';
    if (activeView === 'Quality') return '临床研究项目质量分析';
    if (activeView === 'Financial') return `${selectedBUs.length === 1 ? selectedBUs[0] : ''}项目财务分析`;
    
    return '泰格仪表盘';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7F6]">
      <aside className="w-20 lg:w-64 bg-[#000000] text-white flex flex-col z-50">
        <div className="h-20 flex items-center px-6">
          <img src={LOGO_URL} alt="Tigermed" className="h-8 w-auto invert" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        
        <nav className="flex-1 mt-4 px-3 space-y-1 text-base overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutGrid size={20} />} label="概览" active={activeView === 'Overview'} onClick={() => setActiveView('Overview')} />

          <div className="mt-2">
            <div 
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                ['Operation', 'Quality', 'Progress', 'Financial'].includes(activeView) ? 'bg-[#358568] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setActiveView('Operation')}
            >
              <Activity size={20} />
              <span className="ml-3 hidden lg:block text-base font-bold">项目运营</span>
              <div 
                className="ml-auto hidden lg:block p-1 hover:bg-white/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOperationExpanded(!isOperationExpanded);
                }}
              >
                {isOperationExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              </div>
            </div>

            {isOperationExpanded && (
              <div className="mt-1 ml-4 space-y-1 border-l border-gray-800">
                <SubNavItem icon={<ClipboardCheck size={18} />} label="项目质量" active={activeView === 'Quality'} onClick={() => setActiveView('Quality')} />
                <SubNavItem icon={<TrendingUp size={18} />} label="项目进度" active={activeView === 'Progress'} onClick={() => setActiveView('Progress')} />
                <SubNavItem icon={<DollarSign size={18} />} label="项目财务" active={activeView === 'Financial'} onClick={() => setActiveView('Financial')} />
              </div>
            )}
          </div>

          <NavItem icon={<Users size={20} />} label="项目明细" active={activeView === 'ProjectDetail'} onClick={() => setActiveView('ProjectDetail')} />

          <div className="pt-6 pb-2">
            <span className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden lg:block">系统管理</span>
          </div>
          <NavItem icon={<Package size={20} />} label="图标资源库" active={activeView === 'Icons'} onClick={() => setActiveView('Icons')} />
        </nav>

        <div className="p-4 border-t border-gray-800">
           <div className="flex items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white transition-colors">
              <LogOut size={20} className="mr-3" />
              <span className="hidden lg:block text-base font-medium">退出登录</span>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#358568] text-white flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-3">
            <img src={LOGO_URL} alt="Icon" className="h-6 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
               <span className="text-[12px] opacity-70">时间:</span>
               <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-black/20 text-white border-none text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                 {MONTHS.map(m => <option key={m} value={m} className="text-gray-900">{m}</option>)}
               </select>
            </div>
            
            {showBUFilter && (
              <div className="relative flex items-center space-x-2" ref={buRef}>
                 <span className="text-[12px] opacity-70">部门:</span>
                 <button onClick={() => setIsBUOpen(!isBUOpen)} className="flex items-center justify-between bg-black/20 text-white border-none text-sm rounded-lg px-3 py-1.5 min-w-[120px]">
                   <span className="truncate">
                    {selectedBUs.length === 0 ? '选择部门' : 
                     (isFinancialView || isQualityView || (isProgressView && progressDrillLevel > 0)) ? selectedBUs[0] :
                     selectedBUs.length === BUS.length ? '全部部门' : 
                     selectedBUs.length === 1 ? selectedBUs[0] : `已选 ${selectedBUs.length}`}
                   </span>
                   <ChevronDown size={14} className="ml-2" />
                 </button>
                 {isBUOpen && (
                   <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-[100] min-w-[160px]">
                     {!(isFinancialView || isQualityView || (isProgressView && progressDrillLevel > 0)) && (
                       <div onClick={selectAllBUs} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 text-sm font-bold border-b border-gray-50 mb-1">
                          <span>全部部门</span>
                          {selectedBUs.length === BUS.length && <Check size={14} className="text-[#358568]" />}
                       </div>
                     )}
                     {BUS.map(bu => (
                       <div key={bu} onClick={() => toggleBU(bu)} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 text-sm font-medium">
                         <span>{bu}</span>
                         {selectedBUs.includes(bu) && <Check size={14} className="text-[#358568]" />}
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {showProjectFilter && (
              <div className="relative flex items-center space-x-2" ref={projRef}>
                 <span className="text-[12px] opacity-70">项目:</span>
                 <button onClick={() => setIsProjOpen(!isProjOpen)} className="flex items-center justify-between bg-black/20 text-white border-none text-sm rounded-lg px-3 py-1.5 min-w-[150px]">
                   <span className="truncate max-w-[100px]">{selectedProjects.length === 0 ? '全部项目' : selectedProjects.length === 1 ? selectedProjects[0] : `已选 ${selectedProjects.length}`}</span>
                   <ChevronDown size={14} className="ml-2" />
                 </button>
                 {isProjOpen && (
                   <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-[100] min-w-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                     <div onClick={() => setSelectedProjects([])} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 text-sm font-bold border-b border-gray-50 mb-1">
                        <span>全部项目</span>
                        {selectedProjects.length === 0 && <Check size={14} className="text-[#358568]" />}
                     </div>
                     {ALL_PROJECTS.map(p => {
                        const isBUSelected = selectedBUs.length === 0 || selectedBUs.length === BUS.length || selectedBUs.includes(PROJECT_BU_MAP[p]);
                        return (
                          <div key={p} onClick={() => isBUSelected && toggleProj(p)} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isBUSelected ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-300 bg-gray-50/50 cursor-not-allowed'}`}>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate mr-4">{p}</span>
                                <span className="text-[9px] opacity-50 uppercase">{PROJECT_BU_MAP[p]}</span>
                            </div>
                            {selectedProjects.includes(p) && <Check size={14} className="text-[#358568]" />}
                          </div>
                        );
                     })}
                   </div>
                 )}
              </div>
            )}

            {showRoleSwitcher && (
              <div className="relative flex items-center space-x-2 border-l border-white/20 pl-4" ref={roleRef}>
                <button onClick={() => setIsRoleOpen(!isRoleOpen)} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
                  <UserCircle size={18} />
                  <span className="text-sm font-bold">{userRole}</span>
                  <ChevronDown size={12} />
                </button>
                {isRoleOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-[100] min-w-[120px]">
                    {roles.map(r => (
                      <div key={r} onClick={() => { setUserRole(r); setIsRoleOpen(false); }} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 text-sm font-medium">
                        <span>{r}</span>
                        {userRole === r && <Check size={14} className="text-[#358568]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${active ? 'bg-[#358568] text-white shadow-lg shadow-[#358568]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
    <span className="flex-shrink-0">{icon}</span>
    <span className="ml-3 hidden lg:block text-base font-bold">{label}</span>
    {active && <ChevronRightIcon size={14} className="ml-auto hidden lg:block opacity-50" />}
  </button>
);

const SubNavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${active ? 'text-[#358568] font-bold bg-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <span className="flex-shrink-0 opacity-70">{icon}</span>
    <span className="ml-3 hidden lg:block text-sm">{label}</span>
  </button>
);

export default Layout;
