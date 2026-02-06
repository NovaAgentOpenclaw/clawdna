import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PopulationPage } from './pages/PopulationPage';
import { EvolutionPage } from './pages/EvolutionPage';
import { BreedingPage } from './pages/BreedingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

function Layout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-bold">Claw</span>
            <span className="text-neon-400 font-bold">DNA</span>
            <span className="text-text-muted text-sm">© 2026</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-neon-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-neon-400 transition-colors">API</a>
            <a href="#" className="hover:text-neon-400 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/population" element={<PopulationPage />} />
          <Route path="/evolution" element={<EvolutionPage />} />
          <Route path="/breeding" element={<BreedingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
