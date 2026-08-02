'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
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
  TrendingUp,
  Target,
  Award,
  BarChart2,
  Activity,
  ChevronLeft,
  Zap,
} from 'lucide-react';

const stats = [
  { 
    label: 'إجمالي الاختبارات', 
    value: '1,247', 
    icon: FlaskConical, 
    color: 'text-slab-accent-blue',
    bg: 'bg-slab-accent-blue/10',
    change: '+12%',
    trend: 'up'
  },
  { 
    label: 'اختبارات معتمدة', 
    value: '892', 
    icon: ShieldCheck, 
    color: 'text-slab-accent-emerald',
    bg: 'bg-slab-accent-emerald/10',
    change: '+8%',
    trend: 'up'
  },
  { 
    label: 'أجهزة متصلة', 
    value: '24', 
    icon: Cpu, 
    color: 'text-slab-accent-cyan',
    bg: 'bg-slab-accent-cyan/10',
    change: '0',
    trend: 'neutral'
  },
  { 
    label: 'مشاريع نشطة', 
    value: '18', 
    icon: FolderOpen, 
    color: 'text-slab-accent-gold',
    bg: 'bg-slab-accent-gold/10',
    change: '+3',
    trend: 'up'
  },
];

const recentTests = [
  { id: '1', number: 'TST-MARSHALL-001', template: 'مارشال للثبات والتدفق', project: 'طريق القاهرة - الإسكندرية', mode: 'HARDWARE', status: 'COMPLETED', credibility: 'CERTIFIED', date: '2024-01-15' },
  { id: '2', number: 'TST-CONCRETE-001', template: 'كسر مكعبات الخرسانة', project: 'برج القاهرة الجديدة', mode: 'MANUAL', status: 'IN_PROGRESS', credibility: 'UNVERIFIED', date: '2024-01-16' },
  { id: '3', number: 'TST-SOIL-001', template: 'بروكتور القياسي', project: 'كوبري أكتوبر', mode: 'HARDWARE', status: 'COMPLETED', credibility: 'CERTIFIED', date: '2024-01-17' },
  { id: '4', number: 'TST-MARSHALL-002', template: 'مارشال للثبات والتدفق', project: 'طريق السويس', mode: 'MANUAL', status: 'DRAFT', credibility: 'UNVERIFIED', date: '2024-01-18' },
];

const credibilityLabels = {
  CERTIFIED: { label: 'معتمد', color: 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20' },
  VERIFIED: { label: 'محقق', color: 'bg-slab-accent-gold/10 text-slab-accent-gold border-slab-accent-gold/20' },
  UNVERIFIED: { label: 'غير معتمد', color: 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass' },
};

const statusLabels = {
  COMPLETED: { label: 'مكتمل', color: 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20' },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-slab-accent-blue/10 text-slab-accent-blue border-slab-accent-blue/20' },
  DRAFT: { label: 'مسودة', color: 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass' },
};

const modeLabels = {
  MANUAL: { label: 'يدوي', color: 'text-slab-accent-blue' },
  HARDWARE: { label: 'مؤتمت', color: 'text-slab-accent-emerald' },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slab-text-primary">لوحة التحكم</h1>
          <p className="text-slab-text-secondary mt-1">نظرة عامة على مختبرك واختباراتك</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/tests?create=true">
            <button className="flex items-center gap-2 px-4 py-2 bg-slab-accent-blue hover:bg-slab-accent-blue/90 text-white rounded-lg font-medium text-sm transition-colors">
              <FlaskConical className="h-4 w-4" />
              اختبار جديد
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className={cn(
                'p-5 rounded-xl border transition-all duration-300 hover:border-slab-border-glass-hover',
                stat.bg, 
                'border-slab-border-glass'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn('h-6 w-6', stat.color)} />
                <span className="text-xs font-medium text-slab-text-muted">{stat.change}</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-slab-text-primary font-mono">{stat.value}</p>
                <p className="text-sm text-slab-text-secondary mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slab-card border border-slab-border-glass rounded-xl p-5">
            <h3 className="font-semibold text-slab-text-primary mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-slab-accent-gold" />
              إجراءات سريعة
            </h3>
            <div className="space-y-2">
              <Link href="/dashboard/tests?create=true" className="block">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors text-right">
                  <div className="w-10 h-10 rounded-lg bg-slab-accent-blue/10 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-slab-accent-blue" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">إنشاء اختبار جديد</p>
                    <p className="text-xs text-slab-text-muted">اختر قالب وابدأ فوراً</p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/projects/new" className="block">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors text-right">
                  <div className="w-10 h-10 rounded-lg bg-slab-accent-gold/10 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-slab-accent-gold" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">مشروع جديد</p>
                    <p className="text-xs text-slab-text-muted">إضافة مشروع ومتابعة عيناته</p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/devices" className="block">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors text-right">
                  <div className="w-10 h-10 rounded-lg bg-slab-accent-cyan/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-slab-accent-cyan" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">إدارة الأجهزة</p>
                    <p className="text-xs text-slab-text-muted">ربط وفحص أجهزة IoT</p>
                  </div>
                </button>
              </Link>
              <Link href="/dashboard/certificates" className="block">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slab-text-secondary hover:bg-slab-border-glass hover:text-slab-text-primary transition-colors text-right">
                  <div className="w-10 h-10 rounded-lg bg-slab-accent-emerald/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-slab-accent-emerald" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium">الشهادات والتقارير</p>
                    <p className="text-xs text-slab-text-muted">إصدار شهادات معتمدة QR</p>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slab-card border border-slab-border-glass rounded-xl p-5">
            <h3 className="font-semibold text-slab-text-primary mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slab-accent-cyan" />
              حالة النظام
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slab-border-glass/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slab-accent-emerald" />
                  <span className="text-sm text-slab-text-primary">قاعدة البيانات</span>
                </div>
                <span className="text-xs text-slab-accent-emerald font-medium">متصل</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slab-border-glass/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slab-accent-emerald" />
                  <span className="text-sm text-slab-text-primary">API Server</span>
                </div>
                <span className="text-xs text-slab-accent-emerald font-medium">نشط</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slab-border-glass/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slab-accent-gold" />
                  <span className="text-sm text-slab-text-primary">WebSocket</span>
                </div>
                <span className="text-xs text-slab-accent-gold font-medium">24 جهاز</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slab-border-glass/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slab-accent-emerald" />
                  <span className="text-sm text-slab-text-primary">النسخ الاحتياطي</span>
                </div>
                <span className="text-xs text-slab-accent-emerald font-medium">منذ ساعة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="lg:col-span-2">
          <div className="bg-slab-card border border-slab-border-glass rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slab-border-glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-semibold text-slab-text-primary flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-slab-accent-blue" />
                أحدث الاختبارات
              </h3>
              <Link href="/dashboard/tests" className="text-sm text-slab-accent-blue hover:underline flex items-center gap-1">
                عرض الكل
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slab-border-glass/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">الاختبار</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">المشروع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">الوضع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">المصداقية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slab-border-glass">
                  {recentTests.map((test) => {
                    const cred = credibilityLabels[test.credibility as keyof typeof credibilityLabels];
                    const status = statusLabels[test.status as keyof typeof statusLabels];
                    const mode = modeLabels[test.mode as keyof typeof modeLabels];
                    
                    return (
                      <tr key={test.id} className="hover:bg-slab-border-glass/50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-mono text-sm text-slab-text-primary">{test.number}</p>
                            <p className="text-xs text-slab-text-muted">{test.template}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slab-text-secondary">{test.project}</td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1 text-sm font-medium', mode.color)}>
                            {mode.label === 'مؤتمت' ? <Cpu className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
                            {mode.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', cred.color)}>
                            {cred.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slab-text-muted">
                          {new Date(test.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/dashboard/tests/${test.id}`} className="text-slab-accent-blue hover:underline text-sm font-medium">عرض</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Test Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { category: 'الخرسانة', icon: Building2, color: 'text-slab-accent-red', bg: 'bg-slab-accent-red/10', border: 'border-slab-accent-red/20', tests: 45, certified: 38, desc: 'كسر المكعبات، الانضغاط، السلامب' },
          { category: 'الأسفلت', icon: Target, color: 'text-slab-accent-gold', bg: 'bg-slab-accent-gold/10', border: 'border-slab-accent-gold/20', tests: 32, certified: 28, desc: 'مارشال، التدفق، الاستخلاص، الكثافة' },
          { category: 'التربة', icon: Award, color: 'text-slab-accent-orange', bg: 'bg-slab-accent-orange/10', border: 'border-slab-accent-orange/20', tests: 28, certified: 24, desc: 'بروكتور، CBR، الحدود، الحبيبات' },
        ].map((cat, index) => (
          <div 
            key={cat.category} 
            className={cn('p-5 rounded-xl border transition-all duration-300 hover:border-slab-border-glass-hover', cat.bg, cat.border)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', cat.bg, cat.border)}>
                  <cat.icon className={cn('h-6 w-6', cat.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-slab-text-primary">{cat.category}</h3>
                  <p className="text-xs text-slab-text-muted">{cat.desc}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slab-text-primary font-mono">{cat.tests}</p>
                <p className="text-xs text-slab-text-muted">إجمالي الاختبارات</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slab-border-glass">
              <div className="flex items-center gap-2">
                <ShieldCheck className={cn('h-4 w-4', cat.color)} />
                <span className="text-sm font-medium text-slab-text-primary">{cat.certified} معتمد</span>
              </div>
              <span className="text-xs text-slab-text-muted">{(cat.certified / cat.tests * 100).toFixed(0)}% معدل الاعتماد</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}