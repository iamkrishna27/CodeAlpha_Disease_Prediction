import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AssistantPanel from './AssistantPanel';

const Layout = ({ activeModule, setActiveModule, children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-gray-100">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full pb-20">
            {children}
          </div>
        </main>
      </div>
      <AssistantPanel />
    </div>
  );
};

export default Layout;
