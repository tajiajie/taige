
import React, { useState } from 'react';
import { Download, Check, LayoutGrid, Palette, Terminal, ShieldAlert } from 'lucide-react';

interface IconData {
  name: string;
  category: string;
  svg: string;
}

const ICONS_COLLECTION: IconData[] = [
  {
    name: 'Leadership Cockpit',
    category: 'Navigation',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`
  },
  {
    name: 'BU Operations',
    category: 'Navigation',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  },
  {
    name: 'Project Analysis',
    category: 'Navigation',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
  },
  {
    name: 'Brand Mint',
    category: 'Brand',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#358568"/></svg>`
  },
  {
    name: 'Revenue Flow',
    category: 'Financial',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  },
  {
    name: 'Clinical Efficiency',
    category: 'Financial',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
  },
  {
    name: 'Patient Enrollment',
    category: 'Clinical',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  },
  {
    name: 'Quality Check',
    category: 'Clinical',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`
  },
  {
    name: 'Trend Analysis',
    category: 'Generic',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
  },
  {
    name: 'Performance Target',
    category: 'Generic',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`
  },
  {
    name: 'Alert Warning',
    category: 'Status',
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#358568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
  }
];

const IconLibrary: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadSVG = (svg: string, name: string) => {
    setDownloadingId(name);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.toLowerCase().replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingId(null), 1500);
  };

  const categories = Array.from(new Set(ICONS_COLLECTION.map(i => i.category)));

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#35856810] border border-[#35856820] rounded-2xl p-6">
        <h2 className="text-2xl font-black text-[#358568] mb-2">图标资源库</h2>
        <p className="text-sm text-gray-500 max-w-2xl font-medium">
          看板专用 SVG 图标资源。您可以直接下载图标资源并在项目中使用。
        </p>
      </div>

      {categories.map(cat => (
        <div key={cat} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-6 bg-[#358568] rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">{cat}</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {ICONS_COLLECTION.filter(i => i.category === cat).map(icon => (
              <div key={icon.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-all group relative">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-[#35856810] transition-colors" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                <span className="text-[10px] font-bold text-gray-700 text-center truncate w-full">{icon.name}</span>
                
                <button 
                  onClick={() => downloadSVG(icon.svg, icon.name)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${downloadingId === icon.name ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-[#358568] hover:text-white'}`}
                  title="下载 SVG"
                >
                  {downloadingId === icon.name ? <Check size={14} /> : <Download size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center justify-between">
         <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#358568] rounded-xl flex items-center justify-center text-white">
               <Download size={24} />
            </div>
            <div>
               <h4 className="font-bold text-gray-800">资源包下载</h4>
               <p className="text-xs text-gray-500">点击按钮下载所有 SVG 原始格式图标。</p>
            </div>
         </div>
         <button className="px-6 py-2 bg-[#358568] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#4BA987] transition-all">
           下载全部资源
         </button>
      </div>
    </div>
  );
};

export default IconLibrary;
