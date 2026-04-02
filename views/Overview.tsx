
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart } from 'recharts';
import { DashboardModule, CockpitKPICard } from '../components/Widgets';
import { ICONS, COLORS, MONTHS } from '../constants';
import { Download, MapPin } from 'lucide-react';

interface OverviewProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onDownloadAll?: () => void;
  isExporting?: boolean;
}

const renderBlackLegendText = (value: string) => {
  return <span className="text-gray-700 text-[10px] ml-1">{value}</span>;
};

// Simple hash function for string-based seeds
const getHashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const ChinaMap3D: React.FC<{ month: string, filterSeed: string }> = ({ month, filterSeed }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [currentAdcode, setCurrentAdcode] = useState('100000');
  const [currentName, setCurrentName] = useState('中国全图');

  const loadMap = async (adcode: string, name: string) => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const echarts = (window as any).echarts;
    if (!echarts) return;

    chart.showLoading({ 
      maskColor: 'rgba(0,0,0,0.5)', 
      text: '加载中...',
      textColor: '#fff',
      fontSize: 12
    });
    
    try {
      const url = `/api/geo/areas_v3/bound/${adcode}_full.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!");
      }
      const geoJson = await response.json();
      console.log('GeoJSON data:', response, geoJson);
      echarts.registerMap('currentMap', geoJson);

      const baseSeed = getHashCode(filterSeed);
      const mockData = geoJson.features.map((f: any, index: number) => {
        const provinceName = f.properties.name;
        const val = (getHashCode(f.properties.adcode + filterSeed) % 90) + 10;
        return { name: provinceName, value: val, adcode: f.properties.adcode };
      });
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: { 
          show: true,
          trigger: 'item',
          formatter: (params: any) => {
             if (params.data) {
                return `${params.name}<br/>商机数量: <span style="font-weight:bold;color:#358568">${params.data.value}</span>`;
             }
             return params.name;
          }
        },
        visualMap: {
          min: 0, max: 100, left: 10, bottom: 20, text: ['高', '低'],
          calculable: true, 
          inRange: { color: ['#F0FDF4', '#86C665', '#358568'] },
          textStyle: { fontSize: 10, color: '#6B7280' }
        },
        series: [{
          type: 'map3D', 
          name: 'map3D', 
          map: 'currentMap', 
          data: mockData,
          regionHeight: 3, 
          shading: 'lambert', 
          label: { 
            show: true, 
            textStyle: { color: '#fff', fontSize: 12, backgroundColor: 'rgba(0,0,0,0)' } 
          },
          itemStyle: { 
            opacity: 1, 
            borderWidth: 1, 
            borderColor: '#fff' 
          },
          emphasis: { 
            itemStyle: { color: '#FFD700', opacity: 1 }, 
            label: { show: true } 
          },
          viewControl: { 
            distance: 80, 
            panMouseButton: 'left', 
            rotateMouseButton: 'right', 
            alpha: 40, 
            beta: 0, 
            autoRotate: false 
          },
          postEffect: { 
            enable: true, 
            screenSpaceAmbientOcclusion: { enable: true, radius: 1 } 
          }
        }]
      };
      
      chart.setOption(option, true);
      setCurrentAdcode(adcode);
      setCurrentName(name);
    } catch (e) {
      try {
        const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!");
        }

        const geoJson = await response.json();
        console.log('GeoJSON datatry:', response, geoJson);
        echarts.registerMap('currentMap', geoJson);

        chart.setOption({ series: [{ map: 'currentMap' }] });
        setCurrentAdcode(adcode);
        setCurrentName(name);
      } catch (err) {
        console.warn('Map load failed for adcode:', adcode, err);
      }
    } finally {
      chart.hideLoading();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const echarts = (window as any).echarts;
    if (!echarts) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;
    loadMap('100000', '中国全图');
    chart.on('click', (params: any) => {
      if (params.data && params.data.adcode) loadMap(params.data.adcode, params.name);
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [filterSeed]);

  return (
    <div className="relative w-full h-full bg-[#0b0d10] overflow-hidden rounded-lg">
      <div className="absolute top-4 left-4 z-10 font-sans pointer-events-none">
        <div className="text-white font-bold text-lg mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {currentAdcode === '100000' ? '中国全图 (3D)' : `${currentName} - 3D详情`}
        </div>
        <div className="pointer-events-auto">
          {currentAdcode !== '100000' && (
            <button 
              onClick={() => loadMap('100000', '中国全图')}
              className="px-4 py-2 bg-[#d4a017] hover:bg-[#ffc107] text-white text-sm font-bold rounded transition-colors shadow-lg"
            >
              返回全国
            </button>
          )}
        </div>
      </div>
      
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute bottom-4 right-4 flex flex-col items-end space-y-1 pointer-events-none">
         <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Business Opportunities</div>
         <div className="w-32 h-2 bg-gradient-to-r from-[#F0FDF4] via-[#86C665] to-[#358568] rounded-full shadow-inner"></div>
         <div className="flex justify-between w-32 text-[10px] text-gray-400 font-medium">
            <span>低</span><span>高</span>
         </div>
      </div>
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({ selectedMonth, setSelectedMonth, onDownloadAll, isExporting }) => {
  const [buMetric, setBuMetric] = useState<'ar' | 'collection'>('ar');
  
  // Interactive Filter States
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

  // Helper to generate context-aware mock data
  const filterSeed = useMemo(() => {
    return selectedMonth + (selectedServiceType || 'ALL') + (selectedServiceCategory || 'ALL') + (selectedBU || 'ALL');
  }, [selectedMonth, selectedServiceType, selectedServiceCategory, selectedBU]);

  const dynamicTrendData = useMemo(() => {
    const currentYear = selectedMonth.substring(0, 4);
    const monthsToShow = MONTHS.filter(m => m.startsWith(currentYear) && m <= selectedMonth);
    const baseSeed = getHashCode(filterSeed);
    return monthsToShow.map((m, i) => {
      const factor = (baseSeed + i * 7) % 20 / 20 + 0.5;
      const projectIncome = Math.round(1200 * factor + i * 30);
      const projectCost = Math.round(800 * factor + i * 20);
      const grossMargin = Math.round(((projectIncome - projectCost) / projectIncome) * 100);
      return {
        name: m,
        opportunities: Math.round(800 * factor + i * 20),
        conversion: Math.round(20 + factor * 10),
        projectIncome,
        projectCost,
        grossMargin,
      };
    });
  }, [filterSeed, selectedMonth]);

  const kpis = useMemo(() => {
    const baseSeed = getHashCode(filterSeed);
    const factor = (baseSeed % 20 + 80) / 100;
    return {
      revenue: Math.round(193418 * factor).toLocaleString(),
      revenueRate: (55 * factor).toFixed(1) + "%",
      revenueGrowth: "+" + (12.4 * factor).toFixed(1) + "%",
      
      profit: Math.round(178418 * factor).toLocaleString(),
      profitRate: (55 * factor).toFixed(1) + "%",
      profitGrowth: "+" + (8.2 * factor).toFixed(1) + "%",

      ar: Math.round(93418 * factor).toLocaleString(),
      arInCredit: "¥" + Math.round(5200 * factor).toLocaleString() + "万",
      arUnbilled: "¥" + Math.round(2800 * factor).toLocaleString() + "万",
      arOverdue: "¥" + Math.round(1341 * factor).toLocaleString() + "万",

      projects: Math.round(450 * factor).toLocaleString(),
      ongoingProjects: Math.round(380 * factor).toLocaleString(),
      completedProjects: Math.round(70 * factor).toLocaleString(),

      opportunities: Math.round(1200 * factor).toLocaleString(),
      conversionRate: (28.5 * factor).toFixed(1) + "%",

      bids: Math.round(85 * factor).toLocaleString(),
      bidSuccessRate: (42.0 * factor).toFixed(1) + "%"
    };
  }, [filterSeed]);

  const buPerformanceData = useMemo(() => {
    const baseSeed = getHashCode(selectedMonth);
    const data = [
      { name: 'COBU', revenue: 600 + (baseSeed % 50), profit: 450, ar: 550, collection: 420 },
      { name: 'VPMS', revenue: 550 + (baseSeed % 40), profit: 410, ar: 500, collection: 380 },
      { name: 'ECO', revenue: 520 + (baseSeed % 30), profit: 390, ar: 480, collection: 360 },
      { name: 'IBU', revenue: 480 + (baseSeed % 20), profit: 360, ar: 450, collection: 340 },
      { name: '第三方稽查', revenue: 450 + (baseSeed % 10), profit: 320, ar: 420, collection: 310 },
      { name: '科学事务部', revenue: 380 + (baseSeed % 5), profit: 250, ar: 350, collection: 250 }
    ];
    return [...data].sort((a, b) => b[buMetric] - a[buMetric]);
  }, [buMetric, selectedMonth]);

  const serviceCategoryData = useMemo(() => [
    { name: 'CO', value: 820 },
    { name: 'MW', value: 450 },
    { name: 'MM', value: 300 },
    { name: 'PV', value: 210 },
    { name: 'RA', value: 120 }
  ], []);

  const serviceTypeData = useMemo(() => [
    { name: 'SA', value: 45, color: COLORS.primary },
    { name: 'PV', value: 30, color: '#4BA987' },
    { name: 'PK', value: 25, color: '#B1D996' }
  ], []);

  // Project stages - affected by filters (ServiceType, ServiceCategory, BU)
  const stageRatioData = useMemo(() => {
    const baseSeed = getHashCode(filterSeed);
    return [
      { name: '入组', value: 35 + (baseSeed % 15) },
      { name: '访视', value: 30 + ((baseSeed / 7) % 12) },
      { name: '清理', value: 20 + ((baseSeed / 13) % 10) }
    ];
  }, [filterSeed]);

  const handleTrendClick = (data: any) => {
    if (data && data.activeLabel) {
      setSelectedMonth(data.activeLabel);
    }
  };

  const handleServiceTypeClick = (data: any) => {
    if (data && data.name) {
      setSelectedServiceType(selectedServiceType === data.name ? null : data.name);
    }
  };

  const handleServiceCategoryClick = (data: any) => {
    if (data && data.name) {
      setSelectedServiceCategory(selectedServiceCategory === data.name ? null : data.name);
    }
  };

  const handleBUClick = (data: any) => {
    if (data && data.name) {
      setSelectedBU(selectedBU === data.name ? null : data.name);
    }
  };

  return (
    <div className="flex flex-col space-y-2 h-full relative">
      <div className="grid grid-cols-12 grid-rows-[32fr_32fr_36fr] gap-2 flex-1 min-h-0">
        {/* Row 1 */}
        <DashboardModule title="每月商机趋势" className="col-span-3 row-span-1 min-h-0" icon={ICONS.Trend}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dynamicTrendData} onClick={handleTrendClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis yAxisId="right" orientation="right" hide domain={[0, 200]} /> 
                <Tooltip cursor={{fill: '#35856810'}} />
                <Legend verticalAlign="top" align="right" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{fontSize: '9px', top: -10}} />
                <Bar 
                  yAxisId="left" 
                  dataKey="opportunities" 
                  name="新增商机" 
                  fill={COLORS.primary} 
                  radius={[2, 2, 0, 0]} 
                  barSize={15} 
                  className="cursor-pointer"
                />
                <Line yAxisId="right" type="monotone" dataKey="conversion" name="转化率" stroke={COLORS.line} strokeWidth={2} dot={{r: 3}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>

        <DashboardModule title="" transparent className="col-span-6 row-span-1 min-h-0">
          <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
            <CockpitKPICard 
              label="项目收入" 
              value={kpis.revenue + " 万元"} 
              subValue={`完成率 ${kpis.revenueRate}\n同比 ${kpis.revenueGrowth}`}
              icon={ICONS.Financial} 
              iconColor={COLORS.iconBg.green} 
            />
            <CockpitKPICard 
              label="毛利润" 
              value={kpis.profit + " 万元"} 
              subValue={`完成率 ${kpis.profitRate}\n同比 ${kpis.profitGrowth}`}
              icon={ICONS.Zap} 
              iconColor={COLORS.iconBg.teal} 
            />
            <CockpitKPICard 
              label="应收金额" 
              value={kpis.ar + " 万元"} 
              subValue={`信用期内应收款金额 ${kpis.arInCredit}\n已达节点未开票金额 ${kpis.arUnbilled}\n逾期应收款 ${kpis.arOverdue}`}
              icon={ICONS.Bar} 
              iconColor={COLORS.iconBg.lime} 
            />
            <CockpitKPICard 
              label="项目数量" 
              value={kpis.projects + " 个"} 
              subValue={`在研项目 ${kpis.ongoingProjects}\n已完成项目 ${kpis.completedProjects}`}
              icon={ICONS.Project} 
              iconColor={COLORS.iconBg.emerald} 
            />
            <CockpitKPICard 
              label="商机数量" 
              value={kpis.opportunities + " 个"} 
              subValue={`商机转化率 ${kpis.conversionRate}`}
              icon={ICONS.Trend} 
              iconColor={COLORS.iconBg.blue} 
            />
            <CockpitKPICard 
              label="竞标数量" 
              value={kpis.bids + " 个"} 
              subValue={`竞标成功率 ${kpis.bidSuccessRate}`}
              icon={ICONS.Target} 
              iconColor={COLORS.iconBg.indigo} 
            />
          </div>
        </DashboardModule>

        <DashboardModule title="各服务类型项目对比" className="col-span-3 row-span-1 min-h-0" icon={ICONS.Bar}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceCategoryData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#35856810'}} />
                <Bar 
                  dataKey="value" 
                  barSize={20} 
                  className="cursor-pointer"
                  onClick={(data) => handleServiceCategoryClick(data)}
                >
                  {serviceCategoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-sc-${index}`} 
                      fill={!selectedServiceCategory || selectedServiceCategory === entry.name ? COLORS.primary : `${COLORS.primary}33`} 
                      radius={[2, 2, 0, 0]} 
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>

        {/* Row 2 */}
        <DashboardModule title="每月项目营收趋势" className="col-span-3 row-span-1 min-h-0" icon={ICONS.Trend}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dynamicTrendData} onClick={handleTrendClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 9}} unit="%" />
                <Tooltip cursor={{fill: '#35856810'}} />
                <Legend verticalAlign="top" align="right" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{fontSize: '9px', top: -10}} />
                <Bar 
                  yAxisId="left" 
                  dataKey="projectIncome" 
                  name="项目收入" 
                  fill={COLORS.primary} 
                  radius={[2, 2, 0, 0]} 
                  barSize={12} 
                  className="cursor-pointer"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="projectCost" 
                  name="项目成本" 
                  fill="#B1D996" 
                  radius={[2, 2, 0, 0]} 
                  barSize={12} 
                  className="cursor-pointer"
                />
                <Line yAxisId="right" type="monotone" dataKey="grossMargin" name="毛利率" stroke="#F59E0B" strokeWidth={2} dot={{r: 2}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>

        <DashboardModule title={`商机数量国家地区分布${selectedServiceType ? ` - ${selectedServiceType}` : ''}${selectedServiceCategory ? ` (${selectedServiceCategory})` : ''}${selectedBU ? ` [${selectedBU}]` : ''}`} className="col-span-6 row-span-2 min-h-0" icon={<MapPin size={22} className="mr-2" />}>
          <ChinaMap3D month={selectedMonth} filterSeed={filterSeed} />
        </DashboardModule>

        <DashboardModule title={buMetric === 'ar' ? '各事业部应收情况' : '各事业部回款情况'} className="col-span-3 row-span-1 min-h-0" icon={ICONS.Bar} extra={
          <div className="flex bg-[#F3F4F6] rounded-full p-0.5 text-[9px]">
            <button onClick={() => setBuMetric('ar')} className={`px-2 py-0.5 rounded-full transition-all ${buMetric === 'ar' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400'}`}>应收</button>
            <button onClick={() => setBuMetric('collection')} className={`px-2 py-0.5 rounded-full transition-all ${buMetric === 'collection' ? 'bg-[#358568] text-white shadow-sm' : 'text-gray-400'}`}>回款</button>
          </div>
        }>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buPerformanceData} layout="vertical" margin={{left: -20, right: 30}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11}} width={100} />
                <Tooltip cursor={{fill: '#35856810'}} />
                <Bar 
                  dataKey={buMetric} 
                  barSize={15} 
                  className="cursor-pointer"
                  onClick={(data) => handleBUClick(data)}
                >
                  {buPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-bu-${index}`} 
                      fill={!selectedBU || selectedBU === entry.name ? COLORS.primary : `${COLORS.primary}33`} 
                      radius={[0, 2, 2, 0]} 
                      className="transition-all duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>

        {/* Row 3 */}
        <DashboardModule title="各类型服务费占比" className="col-span-3 row-span-1 min-h-0" icon={ICONS.Pie}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={serviceTypeData} 
                  cx="50%" cy="50%" 
                  innerRadius={45} 
                  outerRadius={70} 
                  dataKey="value"
                  onClick={handleServiceTypeClick}
                  className="cursor-pointer"
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-st-${index}`} 
                      fill={!selectedServiceType || selectedServiceType === entry.name ? entry.color : `${entry.color}33`} 
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{fontSize: '9px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>

        <DashboardModule title="各项目阶段数量占比" className="col-span-3 row-span-1 min-h-0" icon={ICONS.Pie}>
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stageRatioData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                  {stageRatioData.map((entry, index) => (
                    <Cell 
                      key={`cell-stage-${index}`} 
                      fill={index === 0 ? COLORS.primary : index === 1 ? "#4BA987" : "#B1D996"} 
                      className="transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" formatter={renderBlackLegendText} wrapperStyle={{fontSize: '9px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardModule>
      </div>

      <button 
        onClick={onDownloadAll} 
        disabled={isExporting}
        className={`download-trigger absolute bottom-1 right-1 p-1 text-gray-300/30 hover:text-gray-400/80 transition-all z-50 ${isExporting ? 'cursor-not-allowed opacity-50' : ''}`}
        title="下载全量HTML报表"
      >
        <Download size={12} className={isExporting ? 'animate-bounce' : ''} />
      </button>

    </div>
  );
};

export default Overview;
