
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Overview from './views/Overview';
import Operation from './views/Operation';
import ProjectDetail from './views/ProjectDetail';
import IconLibrary from './views/IconLibrary';
import { DashboardView, ProjectSubView, UserRole } from './types';
import { MONTHS, BUS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('Overview');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[11]); 
  const [selectedBUs, setSelectedBUs] = useState([...BUS]); // Default all BUs
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]); // Empty = All
  const [userRole, setUserRole] = useState<UserRole>('BU head');
  
  // Progress specific drill-down state for main operation views
  const [progressDrillLevel, setProgressDrillLevel] = useState<0 | 1 | 2>(0);
  const [progressBU, setProgressBU] = useState<string>('');
  const [progressPM, setProgressPM] = useState<string>('');

  // Tab state for the 'Project Detail' (Enrollment) hub
  const [projectDetailTab, setProjectDetailTab] = useState<ProjectSubView>('Quality');

  // Sync role and filters when drill level changes for main views
  useEffect(() => {
    if (activeView === 'Progress') {
      if (progressDrillLevel === 0) {
        setUserRole('BU head');
      } else if (progressDrillLevel === 1) {
        setUserRole('DO');
      } else if (progressDrillLevel === 2) {
        setUserRole('PM');
      }
    }
  }, [progressDrillLevel, activeView]);

  // Handle role changes from header to navigate levels
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (activeView === 'Progress') {
      if (newRole === 'BU head') setProgressDrillLevel(0);
      else if (newRole === 'DO') setProgressDrillLevel(1);
      else if (newRole === 'PM') setProgressDrillLevel(2);
    }
  };

  useEffect(() => {
    if (activeView === 'Financial') {
      if (selectedBUs.length !== 1 && selectedProjects.length === 0) {
        const defaultBU = selectedBUs.length > 0 ? selectedBUs[0] : BUS[0];
        setSelectedBUs([defaultBU]);
      }
    }
  }, [activeView, selectedBUs, selectedProjects]);

  // Navigate to 'ProjectDetail' (Project Details) hub when a project is clicked
  const handleDrillDown = (projectName: string) => {
    setSelectedProjects([projectName]);
    setProjectDetailTab('Quality');
    setActiveView('ProjectDetail');
  };

  // Handle hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash.startsWith('ProjectDetail_')) {
          const tab = hash.split('_')[1] as ProjectSubView;
          setActiveView('ProjectDetail');
          setProjectDetailTab(tab);
        } else {
          setActiveView(hash as DashboardView);
        }
      }
    };

    // Initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Specialized view switcher to handle sidebar navigation reset logic and hash routing
  const handleViewChange = (view: DashboardView) => {
    if (view === 'Progress') {
      // Per request: Default to BU head and All Projects (clear specific project filter)
      setUserRole('BU head');
      setProgressDrillLevel(0);
      setSelectedProjects([]);
      setSelectedBUs([...BUS]);
    }
    
    // Update hash instead of just state
    window.location.hash = view;
  };

  const [isExporting, setIsExporting] = useState(false);

  // Function to capture all views and download as a single HTML file
  const handleDownloadAll = async () => {
    if (isExporting) return;
    setIsExporting(true);

    const originalView = activeView;
    const views: string[] = ['Overview', 'Operation', 'Quality', 'Progress', 'Financial', 'ProjectDetail_Quality', 'ProjectDetail_Progress', 'ProjectDetail_Financial', 'Icons'];
    const snapshots: Record<string, { title: string; content: string; header: string }> = {};

    // Helper to wait for render
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to process canvas elements into images
    const processCanvases = (container: Element) => {
      const canvases = container.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        try {
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          // Copy classes and styles
          img.className = canvas.className;
          const parent = canvas.parentElement;
          if (parent) {
            parent.replaceChild(img, canvas);
          }
        } catch (e) {
          console.warn('Failed to capture canvas', e);
        }
      });
    };

    try {
      // Capture each view
      for (const v of views) {
        if (v.startsWith('ProjectDetail_')) {
          const tab = v.split('_')[1] as ProjectSubView;
          setActiveView('ProjectDetail');
          setProjectDetailTab(tab);
        } else {
          setActiveView(v as DashboardView);
        }
        
        await wait(1000); // Wait for charts to animate and render
        
        const mainContent = document.querySelector('main > div:last-child');
        const header = document.querySelector('header');
        const title = document.querySelector('h1')?.textContent || '';
        
        if (mainContent && header) {
          // Clone nodes to avoid modifying the live app
          const contentClone = mainContent.cloneNode(true) as HTMLElement;
          const headerClone = header.cloneNode(true) as HTMLElement;
          
          // Process canvases in the clone
          processCanvases(contentClone);
          
          snapshots[v] = {
            title,
            header: headerClone.outerHTML,
            content: contentClone.outerHTML
          };
        }
      }

      // Restore original view
      setActiveView(originalView);
      await wait(100);

      // Get global styles and sidebar
      const headContent = document.head.innerHTML;
      const sidebarHTML = document.querySelector('aside')?.outerHTML || '';
      
      // Construct the standalone HTML
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>泰格项目领导驾驶舱 - 离线报表</title>
    ${headContent}
    <style>
        /* Ensure the offline version looks right */
        body { overflow: hidden; }
        .view-container { display: none; height: 100%; width: 100%; }
        .view-container.active { display: block; }
        /* Hide interactive elements that won't work offline */
        .download-trigger, select, .relative button[onClick] { pointer-events: none; opacity: 0.8; }
        /* Re-enable sidebar navigation */
        aside nav button, aside nav .cursor-pointer { pointer-events: auto !important; opacity: 1 !important; }
        
        /* Sidebar sub-menu animation */
        .sub-menu { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
        .sub-menu.expanded { max-height: 500px; }
    </style>
</head>
<body>
    <div id="offline-root" class="flex h-screen w-screen overflow-hidden bg-[#F4F7F6]">
        ${sidebarHTML}
        <main class="flex-1 flex flex-col min-w-0">
            <div id="header-container"></div>
            <div id="content-container" class="flex-1 overflow-hidden p-4">
                ${views.map(v => `
                    <div id="view-${v}" class="view-container ${v === (originalView === 'ProjectDetail' ? `ProjectDetail_${projectDetailTab}` : originalView) ? 'active' : ''}">
                        ${snapshots[v]?.content || ''}
                    </div>
                `).join('')}
            </div>
        </main>
    </div>

    <script>
        const snapshots = ${JSON.stringify(snapshots)};
        const views = ${JSON.stringify(views)};
        let currentView = "${originalView === 'ProjectDetail' ? `ProjectDetail_${projectDetailTab}` : originalView}";

        // Initialize Sidebar Sub-menu
        const operationMenu = document.querySelector('aside nav > div:nth-child(2)');
        if (operationMenu) {
            const subMenu = operationMenu.querySelector('div:last-child');
            if (subMenu && subMenu.classList.contains('ml-4')) {
                subMenu.classList.add('sub-menu');
                // Check if we should start expanded
                if (["Operation", "Quality", "Progress", "Financial"].includes(currentView)) {
                    subMenu.classList.add('expanded');
                }
            }
        }

        function switchView(viewName) {
            if (!snapshots[viewName]) return;
            
            // Update active state in DOM
            document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
            const targetViewEl = document.getElementById('view-' + viewName);
            if (targetViewEl) targetViewEl.classList.add('active');
            
            // Update Header
            document.getElementById('header-container').innerHTML = snapshots[viewName].header;
            
            // Update Sidebar Active State
            document.querySelectorAll('aside nav button, aside nav .group, aside nav [role="button"], aside nav .cursor-pointer').forEach(btn => {
                const span = btn.querySelector('span');
                if (!span) return;
                const label = span.textContent?.trim();
                const viewMap = {
                    '概览': 'Overview',
                    '项目运营': 'Operation',
                    '项目质量': 'Quality',
                    '项目进度': 'Progress',
                    '项目财务': 'Financial',
                    '项目明细': 'ProjectDetail_Quality',
                    '图标资源库': 'Icons'
                };
                
                const targetView = viewMap[label];
                let isActive = false;
                if (targetView === viewName) {
                    isActive = true;
                } else if (label === '项目明细' && viewName.startsWith('ProjectDetail_')) {
                    isActive = true;
                }
                
                if (isActive) {
                    btn.classList.add('bg-[#358568]', 'text-white', 'shadow-lg');
                    btn.classList.remove('text-gray-400', 'text-gray-500');
                    if (btn.classList.contains('py-2.5') || btn.classList.contains('py-3.5')) {
                        btn.classList.add('font-bold', 'bg-white/5');
                        btn.style.color = 'white';
                    }
                } else {
                    const isSubItem = btn.classList.contains('py-2.5') || btn.classList.contains('py-3.5');
                    if (isSubItem) {
                        btn.classList.remove('text-[#358568]', 'font-bold', 'bg-white/5', 'text-white');
                        btn.classList.add('text-gray-500');
                        btn.style.color = '';
                    } else {
                        btn.classList.remove('bg-[#358568]', 'text-white', 'shadow-lg');
                        btn.classList.add('text-gray-400');
                    }
                }
            });

            // Handle Project Detail Sub-tabs in the captured content
            const tabButtons = document.querySelectorAll('.view-container.active button');
            tabButtons.forEach(btn => {
                const label = btn.textContent?.trim();
                const tabMap = {
                    '项目质量': 'ProjectDetail_Quality',
                    '项目进度': 'ProjectDetail_Progress',
                    '项目财务': 'ProjectDetail_Financial'
                };
                if (tabMap[label]) {
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        switchView(tabMap[label]);
                    };
                    
                    // Update tab active style
                    if (tabMap[label] === viewName) {
                        btn.classList.add('bg-[#358568]', 'text-white', 'shadow-md');
                        btn.classList.remove('text-gray-500');
                    } else {
                        btn.classList.remove('bg-[#358568]', 'text-white', 'shadow-md');
                        btn.classList.add('text-gray-500');
                    }
                }
            });

            currentView = viewName;
        }

        // Initialize
        if (currentView) switchView(currentView);

        // Global Click Listener for Sidebar and Table Rows
        document.addEventListener('click', (e) => {
            // 1. Sidebar Navigation
            const navItem = e.target.closest('aside nav button, aside nav .group, aside nav [role="button"], aside nav .cursor-pointer');
            if (navItem) {
                const span = navItem.querySelector('span');
                if (span) {
                    const label = span.textContent?.trim();
                    
                    // Handle Sub-menu Toggle
                    if (label === '项目运营') {
                        const subMenu = navItem.parentElement.querySelector('.sub-menu');
                        if (subMenu) {
                            subMenu.classList.toggle('expanded');
                            const icon = navItem.querySelector('svg:last-child');
                            if (icon) {
                                icon.style.transform = subMenu.classList.contains('expanded') ? 'rotate(90deg)' : 'rotate(0deg)';
                            }
                        }
                    }

                    const viewMap = {
                        '概览': 'Overview',
                        '项目运营': 'Operation',
                        '项目质量': 'Quality',
                        '项目进度': 'Progress',
                        '项目财务': 'Financial',
                        '项目明细': 'ProjectDetail_Quality',
                        '图标资源库': 'Icons'
                    };
                    if (viewMap[label]) {
                        window.location.hash = viewMap[label];
                    }
                }
                return;
            }

            // 2. Table Row Drill-down (Simulation)
            const tableRow = e.target.closest('tr');
            if (tableRow && !tableRow.closest('thead')) {
                const drillableViews = ['Operation', 'Quality', 'Progress', 'Financial'];
                if (drillableViews.some(v => currentView === v)) {
                    window.location.hash = 'ProjectDetail_Quality';
                }
            }
        });

        // Handle hash routing
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                switchView(hash);
            }
        });

        // Disable all other default actions
        document.querySelectorAll('button:not(aside button), a:not(aside a), select').forEach(el => {
            if (!el.closest('aside')) {
                el.style.cursor = 'default';
                if (!el.onclick) el.onclick = (e) => e.preventDefault();
            }
        });
    </script>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `泰格项目领导驾驶舱_${selectedMonth}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'Overview':
        return <Overview selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} onDownloadAll={handleDownloadAll} isExporting={isExporting} />;
      case 'Operation':
        return <Operation onDrillDown={handleDrillDown} selectedMonth={selectedMonth} selectedBUs={selectedBUs} />;
      case 'Icons':
        return <IconLibrary />;
      case 'ProjectDetail':
        return (
          <ProjectDetail 
            activeTab={projectDetailTab}
            setActiveTab={setProjectDetailTab}
            projectName={selectedProjects[0] || '鸿运华宁-GMA102'}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            selectedMonth={selectedMonth}
            selectedBUs={selectedBUs}
            setSelectedBUs={setSelectedBUs}
          />
        );
      case 'Progress':
      case 'Quality':
      case 'Financial':
        return (
          <ProjectDetail 
            subView={activeView as ProjectSubView} 
            projectName={selectedProjects[0] || '鸿运华宁-GMA102'}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            selectedMonth={selectedMonth}
            selectedBUs={selectedBUs}
            setSelectedBUs={setSelectedBUs}
            userRole={userRole}
            setUserRole={handleRoleChange}
            progressDrillLevel={progressDrillLevel}
            setProgressDrillLevel={setProgressDrillLevel}
            progressBU={progressBU}
            setProgressBU={setProgressBU}
            progressPM={progressPM}
            setProgressPM={setProgressPM}
            setActiveView={handleViewChange}
            setActiveTab={setProjectDetailTab}
          />
        );
      default:
        return <Overview selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />;
    }
  };

  return (
    <>
      <Layout 
        activeView={activeView} 
        setActiveView={handleViewChange}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedBUs={selectedBUs}
        setSelectedBUs={setSelectedBUs}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        userRole={userRole}
        setUserRole={handleRoleChange}
        progressDrillLevel={progressDrillLevel}
        projectDetailTab={projectDetailTab}
      >
        {renderContent()}
      </Layout>
      {isExporting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9999] flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 border border-[#35856833]">
            <div className="w-12 h-12 border-4 border-[#35856822] border-t-[#358568] rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-[#358568] font-bold text-lg">正在生成全量报表</p>
              <p className="text-gray-400 text-xs mt-1">请稍候，正在打包所有页面数据...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
