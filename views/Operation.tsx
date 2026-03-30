
import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, Cell, PieChart, Pie 
} from 'recharts';
import { DashboardModule, HorizontalKPICard } from '../components/Widgets';
import { ICONS, COLORS } from '../constants';
import { ChevronRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface OperationProps {
  onDrillDown: (projectName: string) => void;
  selectedMonth: string;
  selectedBUs: string[];
}

const Operation: React.FC<OperationProps> = ({ onDrillDown, selectedMonth, selectedBUs }) => {
  const [healthFilter, setHealthFilter] = useState<string | null>(null);
  const [dimMode, setDimMode] = useState<'stage' | 'area' | 'indication'>('area');

  const seed = useMemo(() => {
    const monthNum = parseInt(selectedMonth) || 100;
    const buCount = selectedBUs.length;
    return monthNum + buCount * 10;
  }, [selectedMonth, selectedBUs]);

  const kpiMetrics = useMemo(() => {
    const factor = 0.8 + (seed % 40) / 100;
    const formatValue = (val: number, isPercent = false) => {
      const v = (val * factor);
      if (isPercent) return v.toFixed(2) + "%";
      return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " 万元";
    };

    return {
      revenue: { month: formatValue(306.00), year: formatValue(3406.00) },
      profit: { month: formatValue(214.00), year: formatValue(2400.00) },
      margin: { month: formatValue(57.32, true), year: formatValue(69.56, true) },
      ar: { month: formatValue(318.70), year: formatValue(2317.54) },
      collection: { month: formatValue(213.34), year: formatValue(1835.76) },
      rate: { month: formatValue(57.32, true), year: formatValue(69.56, true) },
      projects: { month: Math.round(100 * factor) + " 个", year: Math.round(5 * factor) + " 个" }
    };
  }, [seed]);

  const revenueProfitData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      name: `项目${i + 1}`,
      revenue: Math.round(40 + (seed % (i + 10)) * 5),
      profit: Math.round(5 + (seed % (i + 5)) * 2),
    }));
  }, [seed]);

  // Dimension data for the rightmost bar chart
  const dimensionData = useMemo(() => {
    if (dimMode === 'stage') {
      const stages = ['准备', '启动', '入组', '随访', '数据清理', '完成', '关闭'];
      return stages.map((s, i) => ({
        name: s,
        value: Math.round(15 + (seed % (i + 5)) * 3)
      }));
    } else if (dimMode === 'area') {
      const areas = ['肿瘤领域', '免疫领域', '心血管', '血液病', '中枢神经', '内分泌'];
      const data = areas.map((a, i) => ({
        name: a,
        value: Math.round(20 + (seed % (i + 8)) * 5)
      }));
      return data.sort((a, b) => b.value - a.value);
    } else { // indication
      const indications = ['肺癌', '乳腺癌', '淋巴瘤', '白血病', '胃癌', '糖尿病', '高血压'];
      const data = indications.map((ind, i) => ({
        name: ind,
        value: Math.round(10 + (seed % (i + 3)) * 4)
      }));
      return data.sort((a, b) => b.value - a.value);
    }
  }, [seed, dimMode]);

  const allProjects = useMemo(() => {
    const projectsByBU: Record<string, { id: string, name: string }[]> = {
      'COBU': [
        { id: 'C1', name: '鸿运华宁-GMA102 治疗2型糖' },
        { id: 'C2', name: '万泰生物-WT-021 疫苗二期' },
        { id: 'C3', name: '君实生物-JS001 PD-1单抗' },
        { id: 'C4', name: '康希诺-CN-09 疫苗三期' },
        { id: 'C5', name: '信达生物-IBI306 脂质项目' },
        { id: 'C6', name: '恒瑞-SH-0911 肿瘤项目' },
      ],
      'ECO': [
        { id: 'E1', name: '复星医药-FS001 肿瘤靶向项目' },
        { id: 'E2', name: '药明生物-WXB-902 联合用药' },
        { id: 'E3', name: '齐鲁制药-QL-902 肿瘤靶向' },
        { id: 'E4', name: '恒瑞医药-HR092 呼吸系统研究' },
      ],
      'VPMS': [
        { id: 'V1', name: '正大天晴-CTT-082 抗病毒研究' },
        { id: 'V2', name: '长春高新-CHH-001 生长激素' },
        { id: 'V3', name: '贝达药业-BD-022 肺癌靶向研究' },
      ],
      'IBU': [
        { id: 'I1', name: '国际项目-INT-9901 跨国多中心' },
        { id: 'I2', name: 'Pfizer-PFE-022 心血管研究' },
      ]
    };

    let baseProjects: { id: string, name: string }[] = [];
    selectedBUs.forEach(bu => {
      if (projectsByBU[bu]) baseProjects = [...baseProjects, ...projectsByBU[bu]];
    });

    return baseProjects.map((p, i) => {
      const pSeed = seed + i * 13 + (p.id.charCodeAt(0));
      // Adjust score to favor "Healthy" (most frequent) and reduce "Abnormal" (least frequent)
      const score = 65 + (pSeed % 35); // Range 65 - 99
      return {
        ...p,
        quality: 60 + (pSeed % 38),
        progress: 50 + (pSeed % 45),
        financial: 55 + (pSeed % 42),
        people: 65 + (pSeed % 33),
        health: score > 75 ? '健康' : score > 70 ? '预警' : '异常'
      };
    });
  }, [seed, selectedBUs]);

  const healthDistributionData = useMemo(() => {
    const counts = { '健康': 0, '异常': 0, '预警': 0 };
    allProjects.forEach(p => {
      counts[p.health as keyof typeof counts]++;
    });
    return [
      { name: '健康', value: counts['健康'], color: '#358568' },
      { name: '预警', value: counts['预警'], color: '#F59E0B' },
      { name: '异常', value: counts['异常'], color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (!healthFilter) return allProjects;
    return allProjects.filter(p => p.health === healthFilter);
  }, [allProjects, healthFilter]);

  const renderBlackLegendText = (value: string) => {
    return <span className="text-gray-700 text-[10px] ml-1">{value}</span>;
  };

  const handleHealthClick = (data: any) => {
    if (data && data.name) {
      setHealthFilter(healthFilter === data.name ? null : data.name);
    }
  };

  const getDimTitle = () => {
    if (dimMode === 'area') return '不同治疗领域项目数量';
    if (dimMode === 'indication') return '不同适应症项目数量';
    return '不同阶段项目数量';
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-hidden">
      {/* Top Indicators Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center flex-shrink-0">
        <HorizontalKPICard 
          label="项目收入" 
          icon={ICONS.Project} 
          iconColor="#7C3AED" 
          items={[{ label: '本月', value: kpiMetrics.revenue.month }, { label: '当年', value: kpiMetrics.revenue.year }]} 
        />
        <HorizontalKPICard 
          label="毛利润" 
          icon={ICONS.Bar} 
          iconColor="#358568" 
          items={[{ label: '本月', value: kpiMetrics.profit.month }, { label: '当年', value: kpiMetrics.profit.year }]} 
        />
        <HorizontalKPICard 
          label="毛利率" 
          icon={ICONS.Trend} 
          iconColor="#3B82F6" 
          items={[{ label: '本月', value: kpiMetrics.margin.month }, { label: '当年', value: kpiMetrics.margin.year }]} 
        />
        <HorizontalKPICard 
          label="应收账款" 
          icon={ICONS.Financial} 
          iconColor="#F59E0B" 
          items={[{ label: '本月', value: kpiMetrics.ar.month }, { label: '当年', value: kpiMetrics.ar.year }]} 
        />
        <HorizontalKPICard 
          label="回款金额" 
          icon={ICONS.Zap} 
          iconColor="#10B981" 
          items={[{ label: '本月', value: kpiMetrics.collection.month }, { label: '当年', value: kpiMetrics.collection.year }]} 
        />
        <HorizontalKPICard 
          label="回款率" 
          icon={ICONS.Target} 
          iconColor="#6366F1" 
          items={[{ label: '本月', value: kpiMetrics.rate.month }, { label: '当年', value: kpiMetrics.rate.year }]} 
        />
        <HorizontalKPICard 
          label="在研项目数量" 
          icon={ICONS.Projects} 
          iconColor="#EA580C" 
          items={[{ label: '在研', value: kpiMetrics.projects.month }, { label: '新增', value: kpiMetrics.projects.year }]} 
        />
      </div>

      <div className="grid grid-cols-12 gap-4 h-[260px] flex-shrink-0">
        <div className="col-span-4 h-full">
          <DashboardModule title="项目收入与毛利润分析" className="h-full" icon={ICONS.Bar}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueProfitData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend verticalAlign="top" align="right" iconType="rect" formatter={renderBlackLegendText} wrapperStyle={{ top: -10, fontSize: 9 }} />
                <Bar dataKey="revenue" name="项目收入" fill="#358568" barSize={14} radius={[2, 2, 0, 0]} />
                <Bar dataKey="profit" name="毛利润" fill="#7ABFAD" barSize={14} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashboardModule>
        </div>

        <div className="col-span-4 h-full">
          <DashboardModule 
            title="项目健康度数量分布"
            className="h-full" 
            icon={ICONS.Pie}
            extra={
              healthFilter && (
                <button 
                  onClick={() => setHealthFilter(null)}
                  className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-all font-bold"
                >
                  清除筛选: {healthFilter}
                </button>
              )
            }
          >
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* Updated margin and cy to position the chart upwards and avoid cutoff */}
                <PieChart margin={{ top: 15, right: 10, bottom: 0, left: 10 }}>
                  <Pie 
                    data={healthDistributionData} 
                    cx="50%" cy="45%" 
                    innerRadius={40} 
                    outerRadius={65} 
                    paddingAngle={5} 
                    dataKey="value"
                    onClick={handleHealthClick}
                    className="cursor-pointer"
                  >
                    {healthDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={healthFilter === entry.name ? '#000' : 'none'}
                        strokeWidth={2}
                        className="transition-all duration-300"
                        style={{ filter: healthFilter && healthFilter !== entry.name ? 'opacity(0.3)' : 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{ top: -10, fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardModule>
        </div>

        <div className="col-span-4 h-full">
          <DashboardModule 
            title={getDimTitle()} 
            className="h-full" 
            icon={ICONS.Bar}
            extra={
              <div className="flex bg-[#F3F4F6] rounded-full p-0.5 text-[9px] shadow-inner">
                <button 
                  onClick={() => setDimMode('area')} 
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${dimMode === 'area' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >治疗领域</button>
                <button 
                  onClick={() => setDimMode('indication')} 
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${dimMode === 'indication' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >适应症</button>
                <button 
                  onClick={() => setDimMode('stage')} 
                  className={`px-3 py-1 rounded-full transition-all duration-200 ${dimMode === 'stage' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >阶段</button>
              </div>
            }
          >
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={70} />
                  <Tooltip cursor={{ fill: '#35856810' }} />
                  <Bar dataKey="value" name="项目数量" barSize={15} radius={[0, 2, 2, 0]} fill="#358568" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardModule>
        </div>
      </div>

      <DashboardModule title={`事业部项目健康度看板 ${healthFilter ? `(已筛选: ${healthFilter})` : ''}`} className="flex-1 min-h-0" icon={ICONS.ModuleTitle}>
        <div className="h-full flex flex-col">
          <div className="overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#358568] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider">项目名称</th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider">质量</th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider">进度</th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider">财务</th>
                  <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider">人员</th>
                  {/* Updated header text from '结论' to '健康度得分' */}
                  <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider">健康度得分</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="group hover:bg-[#F0F7F4] transition-colors cursor-pointer" onClick={() => onDrillDown(project.name)}>
                    <td className="px-6 py-2">
                      <div className="font-bold text-gray-800 text-xs group-hover:text-[#358568] transition-colors truncate max-w-[220px]">{project.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-tighter">编号: PRJ-2025-{project.id}</div>
                    </td>
                    <td className="px-6 py-2 text-center"><ScoreDisplay value={project.quality} /></td>
                    <td className="px-6 py-2 text-center"><ScoreDisplay value={project.progress} /></td>
                    <td className="px-6 py-2 text-center"><ScoreDisplay value={project.financial} /></td>
                    <td className="px-6 py-2 text-center"><ScoreDisplay value={project.people} /></td>
                    <td className="px-6 py-2 text-center"><HealthStatusBadge status={project.health as any} /></td>
                    <td className="px-6 py-2 text-right">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#358568] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={14} />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm italic font-medium">
                      暂无符合 "{healthFilter}" 状态的项目数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardModule>
    </div>
  );
};

const HealthStatusBadge: React.FC<{ status: '健康' | '预警' | '异常' }> = ({ status }) => {
  const styles = { '健康': 'bg-green-50 text-green-700 border-green-200', '预警': 'bg-amber-50 text-amber-700 border-amber-200', '异常': 'bg-red-50 text-red-700 border-red-200' };
  const icons = { '健康': <CheckCircle2 size={12} className="mr-1" />, '预警': <Info size={12} className="mr-1" />, '异常': <AlertCircle size={12} className="mr-1" /> };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]} shadow-sm`}>
      {icons[status]}
      {status}
    </span>
  );
};

const ScoreDisplay: React.FC<{ value: number }> = ({ value }) => {
  const textColor = value >= 90 ? 'text-[#358568]' : value >= 70 ? 'text-amber-600' : 'text-red-500';
  return (
    <div className="flex flex-col items-center">
      <span className={`text-[12px] font-black ${textColor} tracking-tight`}>{value.toFixed(2)}</span>
      <div className="w-10 h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden shadow-inner">
        <div className={`h-full shadow-sm ${value >= 90 ? 'bg-[#358568]' : value >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export default Operation;
