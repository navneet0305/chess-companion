import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PlayPage from './pages/PlayPage';
import AnalysisPage from './pages/AnalysisPage';
import ThemesPage from './pages/ThemesPage';
import CompanionStudioPage from './pages/CompanionStudioPage';
import StatisticsPage from './pages/StatisticsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Main Gameplay Screen */}
        <Route index element={<PlayPage />} />
        <Route path="play" element={<PlayPage />} />

        {/* Phase 6: Analysis & AI Review */}
        <Route path="analysis" element={<AnalysisPage />} />

        {/* Phase 5: Seasonal & Custom Themes */}
        <Route path="themes" element={<ThemesPage />} />

        {/* Phase 4: Companion Studio & Customization */}
        <Route path="companions" element={<CompanionStudioPage />} />

        {/* Phase 7: Player Statistics & Progression */}
        <Route path="statistics" element={<StatisticsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
