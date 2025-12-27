import { useState } from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'review', label: 'Code Review', icon: '🔍' },
    { id: 'codegen', label: 'Code Chatbot', icon: '🤖' },
    { id: 'roadmap', label: 'Learning Roadmap', icon: '🗺️' },
    { id: 'progress', label: 'Progress Dashboard', icon: '📊' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <button
        className="nav-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        <div className={`nav-toggle-icon ${sidebarOpen ? 'open' : ''}`}>
          <span></span>
        </div>
      </button>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="nav-container">
          <h2 className="nav-title">AI Code Assistant</h2>
          <ul className="nav-list">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  onClick={() => handleTabClick(tab.id)}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
