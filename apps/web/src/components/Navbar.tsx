import React from 'react';
import { 
  Layers, 
  BookOpen, 
  History, 
  Terminal, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Monitor,
  Sparkles
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  activeAttemptId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onSetTheme,
  activeAttemptId
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'problems', label: 'Problems', icon: BookOpen },
    { id: 'attempts', label: 'My Attempts', icon: History },
    { id: 'workspace', label: 'Design Lab', icon: Terminal, disabled: !activeAttemptId },
    { id: 'security', label: 'Security', icon: ShieldCheck }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                DESIGNFORGE
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                Studio
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-slate-400 font-medium">
              DESIGN. DEFEND. IMPROVE.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && onSelectTab(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : item.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Dropdown / Toggler */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-slate-400">
            <button
              onClick={() => onSetTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'hover:text-slate-200'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-slate-800 text-amber-400' : 'hover:text-slate-200'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetTheme('system')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-slate-800 text-indigo-400' : 'hover:text-slate-200'}`}
              title="System Mode"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Persona */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-glow-violet">
              SA
            </div>
            <div className="text-left leading-tight">
              <span className="text-xs font-semibold text-slate-200 block">Lead Architect</span>
              <span className="text-[10px] text-emerald-400 font-mono">L6 Candidate</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
