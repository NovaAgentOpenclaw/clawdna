import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, 
  Users, 
  LineChart, 
  GitMerge, 
  Trophy, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const navItems = [
  { path: '/', label: 'Home', icon: Sparkles },
  { path: '/population', label: 'Population', icon: Users },
  { path: '/evolution', label: 'Evolution', icon: LineChart },
  { path: '/breeding', label: 'Breeding', icon: GitMerge },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-neon-500/20 to-neon-600/10 rounded-xl transition-transform duration-300 group-hover:scale-105">
              <Dna className="w-7 h-7 text-neon-400" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-text-primary">
                Claw
                <span className="text-gradient">DNA</span>
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    'flex items-center gap-2',
                    isActive 
                      ? 'text-neon-400' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-neon-500/10 rounded-lg border border-neon-500/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive 
                          ? 'bg-neon-500/10 text-neon-400 border border-neon-500/20' 
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
