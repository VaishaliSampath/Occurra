import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import VideoAnalysis from './pages/VideoAnalysis';
import HeatmapAnalytics from './pages/HeatmapAnalytics';
import Insights from './pages/Insights';
import About from './pages/About';

function App() {
  // Single source of truth for analysis states
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Load from local storage on mount
  useEffect(() => {
    const cachedLatest = localStorage.getItem('occurra_latest');
    const cachedHistory = localStorage.getItem('occurra_history');

    if (cachedLatest) {
      setLatestAnalysis(JSON.parse(cachedLatest));
    }
    if (cachedHistory) {
      setAnalysisHistory(JSON.parse(cachedHistory));
    }
  }, []);

  // Update analysis data and history lists predictably
  const handleNewAnalysis = (result, fileName) => {
    const enrichedResult = {
      ...result,
      fileName: fileName || 'Uploaded Video',
      timestamp: new Date().toLocaleString(),
      id: Date.now().toString(),
    };

    // Update latest analysis state and storage
    setLatestAnalysis(enrichedResult);
    localStorage.setItem('occurra_latest', JSON.stringify(enrichedResult));

    // Update history, keeping up to 10 latest unique runs
    setAnalysisHistory((prevHistory) => {
      // Avoid duplicate filenames or identical analysis timestamps
      const filtered = prevHistory.filter(
        (item) => item.fileName !== enrichedResult.fileName
      );
      const updated = [enrichedResult, ...filtered].slice(0, 10);
      localStorage.setItem('occurra_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setLatestAnalysis(null);
    setAnalysisHistory([]);
    localStorage.removeItem('occurra_latest');
    localStorage.removeItem('occurra_history');
  };
  const clearLatestAnalysis = () => {
    setLatestAnalysis(null);
    localStorage.removeItem("occurra_latest");
  };
  return (
    <Router>
      <div className="min-h-screen bg-[#070b13] text-slate-100 flex font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 pl-64 flex flex-col min-h-screen">
          {/* Top Header Navbar */}
          <Navbar />

          {/* Page Routing Container */}
          <main className="flex-grow pt-24 pb-12 px-8 overflow-y-auto">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-64 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    latestAnalysis={latestAnalysis}
                    history={analysisHistory}
                    clearHistory={clearHistory}
                  />
                }
              />
              <Route
                path="/analysis"
                element={
                  <VideoAnalysis
                    latestAnalysis={latestAnalysis}
                    onAnalysisComplete={handleNewAnalysis}
                    clearLatestAnalysis={clearLatestAnalysis}
                  />
                }
              />
              <Route
                path="/heatmap"
                element={<HeatmapAnalytics latestAnalysis={latestAnalysis} />}
              />
              <Route
                path="/insights"
                element={<Insights latestAnalysis={latestAnalysis} />}
              />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
