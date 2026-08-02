'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Globe, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'ar', flag: '🇸🇦', name: 'العربية', dir: 'rtl' },
  { code: 'en', flag: '🇺🇸', name: 'English', dir: 'ltr' },
  { code: 'fr', flag: '🇫🇷', name: 'Français', dir: 'ltr' },
  { code: 'zh', flag: '🇨🇳', name: '中文', dir: 'ltr' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский', dir: 'ltr' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch', dir: 'ltr' },
];

interface AppHeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: (open: boolean) => void;
  userMenuOpen: boolean;
  onUserMenuToggle: (open: boolean) => void;
  userDropdownRef: React.RefObject<HTMLDivElement>;
  session: any;
  status: string;
  onSignOut: () => void;
}

export function AppHeader({ 
  sidebarOpen, 
  onSidebarToggle, 
  mobileMenuOpen, 
  onMobileMenuToggle,
  userMenuOpen,
  onUserMenuToggle,
  userDropdownRef,
  session,
  status,
  onSignOut
}: AppHeaderProps) {
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = languages.find(l => l.code === 'ar') || languages[0];

  useEffect(() => {
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = currentLang.code;
  }, [currentLang]);

  const handleClickOutside = (event: MouseEvent) => {
    if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
      setLangOpen(false);
    }
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
      onUserMenuToggle(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langOpen, userMenuOpen, onUserMenuToggle]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slab-card/90 backdrop-blur-2xl border-b border-slab-border-glass lg:pl-64 transition-all duration-300">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => onMobileMenuToggle(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={onSidebarToggle}
            aria-label={sidebarOpen ? 'طي الشريط الجانبي' : 'توسيع الشريط الجانبي'}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors"
              onClick={() => setLangOpen(!langOpen)}
            >
              <span className="w-2 h-2 rounded-full bg-slab-accent-emerald" />
              <span className="text-slab-text-secondary">{currentLang.flag}</span>
              <span className="font-semibold uppercase">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', langOpen && 'rotate-180')} />
            </Button>

            {langOpen && (
              <div className="absolute top-full right-0 mt-2 min-w-[140px] bg-slab-card border border-slab-border-glass rounded-lg shadow-xl p-2 animate-fade-in z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLangOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
                      lang.code === 'ar' 
                        ? 'bg-slab-accent-blue/10 text-slab-accent-blue' 
                        : 'text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-slab-accent-emerald flex-shrink-0" />
                    <span className="flex-shrink-0">{lang.flag}</span>
                    <span className="uppercase">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors"
              onClick={() => onUserMenuToggle(!userMenuOpen)}
            >
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-slab-border-glass object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slab-accent-blue to-slab-accent-gold flex items-center justify-center font-bold text-white text-sm">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="hidden sm:block text-slab-text-secondary truncate max-w-[120px]">
                {session?.user?.name || 'مستخدم'}
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', userMenuOpen && 'rotate-180')} />
            </Button>

            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-slab-card border border-slab-border-glass rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
                <div className="p-3 border-b border-slab-border-glass">
                  <p className="text-sm font-medium text-slab-text-primary">{session?.user?.name || 'مستخدم'}</p>
                  <p className="text-xs text-slab-text-muted">{session?.user?.email || 'لا يوجد بريد'}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary"
                  onClick={() => onUserMenuToggle(false)}
                >
                  <User className="h-4 w-4" />
                  ملفي الشخصي
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary"
                  onClick={() => onUserMenuToggle(false)}
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </Link>
                <hr className="border-slab-border-glass my-1" />
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slab-accent-red hover:bg-slab-accent-red/10"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}