'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FlaskConical, 
  FolderOpen, 
  Users, 
  Settings, 
  ShieldCheck,
  FileText,
  Cpu,
  Building2,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { name: 'الاختبارات', href: '/dashboard/tests', icon: FlaskConical },
  { name: 'المشاريع', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'الأجهزة', href: '/dashboard/devices', icon: Cpu },
  { name: 'الشهادات', href: '/dashboard/certificates', icon: ShieldCheck },
  { name: 'التقارير', href: '/dashboard/reports', icon: FileText },
  { name: 'الفريق', href: '/dashboard/team', icon: Users },
  { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    // TODO: Implement sign out
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slab-deep text-slab-text-primary font-sans antialiased">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-slab-card/95 backdrop-blur-xl border-r border-slab-border-glass transition-all duration-300 lg:relative lg:z-auto',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn('flex h-16 items-center justify-between px-4 border-b border-slab-border-glass', !sidebarOpen && 'justify-center')}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slab-accent-blue to-slab-accent-emerald flex items-center justify-center font-bold text-white text-sm">
                SL
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-slab-text-primary">
                  smart<span className="text-slab-accent-gold">LAB</span>
                </span>
              )}
            </Link>
            <button
              className={cn('lg:hidden p-2 rounded-lg hover:bg-slab-border-glass transition-colors')}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto" aria-label="التنقل الرئيسي">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary',
                    !sidebarOpen && 'justify-center'
                  )}
                  title={sidebarOpen ? undefined : item.name}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn('border-t border-slab-border-glass p-3', !sidebarOpen && 'hidden')}>
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slab-accent-blue/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-slab-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slab-text-primary truncate">شركتك الهندسية</p>
                <p className="text-xs text-slab-text-muted truncate">مهندس موقع</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('lg:pl-64 transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-20')}>
        <AppHeader 
          sidebarOpen={sidebarOpen} 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={setMobileMenuOpen}
          userMenuOpen={userMenuOpen}
          onUserMenuToggle={setUserMenuOpen}
          userDropdownRef={userDropdownRef}
          session={{ user: { name: 'مهندس أحمد', email: 'ahmed@example.com', image: null } }}
          status="authenticated"
          onSignOut={handleSignOut}
        />

        <main className="p-4 lg:p-6" dir="rtl">
          {children}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}