'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  FlaskConical, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  Wifi, 
  Usb,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  MoreVertical,
  Settings,
  Sparkles, X,
} from 'lucide-react';
import { TestModeTabsSimple as TestModeTabs } from '@/components/tests/TestModeTabsSimple';

const mockTests = [
  {
    id: '1',
    testNumber: 'TST-MARSHALL-001',
    template: { id: 'marshall-stability', name: 'مارشال للثبات والتدفق (ASTM D6927)', category: 'الأسفلت' },
    mode: 'MANUAL',
    status: 'COMPLETED',
    credibilityLevel: 'UNVERIFIED',
    createdAt: '2024-01-15T10:30:00Z',
    project: { name: 'مشروع طريق القاهرة - الإسكندرية' },
  },
  {
    id: '2',
    testNumber: 'TST-MARSHALL-002',
    template: { id: 'marshall-stability', name: 'مارشال للثبات والتدفق (ASTM D6927)', category: 'الأسفلت' },
    mode: 'HARDWARE',
    status: 'COMPLETED',
    credibilityLevel: 'CERTIFIED',
    createdAt: '2024-01-16T14:20:00Z',
    project: { name: 'مشروع كوبري أكتوبر' },
  },
  {
    id: '3',
    testNumber: 'TST-CONCRETE-001',
    template: { id: 'concrete-cube', name: 'كسر مكعبات الخرسانة (EN 12390-3)', category: 'الخرسانة' },
    mode: 'MANUAL',
    status: 'IN_PROGRESS',
    credibilityLevel: 'UNVERIFIED',
    createdAt: '2024-01-17T09:00:00Z',
    project: { name: 'مشروع برج القاهرة الجديدة' },
  },
];

const credibilityLabels: Record<'CERTIFIED' | 'VERIFIED' | 'UNVERIFIED', { label: string; color: string; icon: any }> = {
  CERTIFIED: { label: 'معتمد', color: 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20', icon: ShieldCheck },
  VERIFIED: { label: 'محقق', color: 'bg-slab-accent-gold/10 text-slab-accent-gold border-slab-accent-gold/20', icon: AlertTriangle },
  UNVERIFIED: { label: 'غير معتمد', color: 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass', icon: XCircle },
};

const statusLabels: Record<'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED', { label: string; color: string; icon?: any }> = {
  DRAFT: { label: 'مسودة', color: 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass' },
  IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-slab-accent-blue/10 text-slab-accent-blue border-slab-accent-blue/20' },
  COMPLETED: { label: 'مكتمل', color: 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20' },
  ARCHIVED: { label: 'مؤرشف', color: 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass' },
};

const modeLabels: Record<'MANUAL' | 'HARDWARE', { label: string; icon: any; color: string }> = {
  MANUAL: { label: 'يدوي', icon: FlaskConical, color: 'text-slab-accent-blue' },
  HARDWARE: { label: 'مؤتمت', icon: Cpu, color: 'text-slab-accent-emerald' },
};

const categoryColors: Record<string, string> = {
  'الخرسانة': 'bg-slab-accent-red/10 text-slab-accent-red border-slab-accent-red/20',
  'الأسفلت': 'bg-slab-accent-gold/10 text-slab-accent-gold border-slab-accent-gold/20',
  'التربة': 'bg-slab-accent-orange/10 text-slab-accent-orange border-slab-accent-orange/20',
};

export default function TestsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedTest, setSelectedTest] = useState<typeof mockTests[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCredibility, setFilterCredibility] = useState('all');

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slab-text-primary">إدارة الاختبارات</h1>
          <p className="text-slab-text-secondary mt-1">إنشاء ومتابعة اختبارات الخرسانة والأسفلت والتربة</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          اختبار جديد
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slab-card border border-slab-border-glass rounded-lg p-1">
          <TabsTrigger value="list" className="bg-transparent hover:bg-slab-border-glass data-[state=active]:bg-slab-accent-blue/10 data-[state=active]:text-slab-accent-blue">
            قائمة الاختبارات
          </TabsTrigger>
          <TabsTrigger value="create" className="bg-transparent hover:bg-slab-border-glass data-[state=active]:bg-slab-accent-blue/10 data-[state=active]:text-slab-accent-blue">
            إنشاء اختبار
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="mt-4 animate-fade-in">
          <div className="bg-slab-card border border-slab-border-glass rounded-xl overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slab-border-glass flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slab-text-muted" />
                <input
                  type="text"
                  placeholder="البحث برقم الاختبار، المشروع، القالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary placeholder-slab-text-muted focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all appearance-none"
                >
                  <option value="all">جميع الأقسام</option>
                  <option value="concrete">الخرسانة</option>
                  <option value="asphalt">الأسفلت</option>
                  <option value="soil">التربة</option>
                </select>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="px-3 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all appearance-none"
                >
                  <option value="all">جميع الأوضاع</option>
                  <option value="MANUAL">يدوي</option>
                  <option value="HARDWARE">مؤتمت</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="COMPLETED">مكتمل</option>
                  <option value="IN_PROGRESS">قيد التنفيذ</option>
                  <option value="DRAFT">مسودة</option>
                </select>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  تصفية
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slab-border-glass/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">رقم الاختبار</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">القالب</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">القسم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">المشروع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">الوضع</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">المصداقية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slab-text-muted uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slab-border-glass">
                  {mockTests.map((test) => {
                    const cred = credibilityLabels[test.credibilityLevel as keyof typeof credibilityLabels];
                    const status = statusLabels[test.status as keyof typeof statusLabels];
                    const mode = modeLabels[test.mode as keyof typeof modeLabels];
                    const categoryColor = categoryColors[test.template.category as keyof typeof categoryColors] || 'bg-slab-border-glass text-slab-text-muted';
                    const CredIcon = cred.icon;
                    const ModeIcon = mode.icon;
                    const StatusIcon = status.icon || CheckCircle2;

                    return (
                      <tr key={test.id} className="hover:bg-slab-border-glass/50 transition-colors">
                        <td className="px-4 py-4 text-sm font-mono text-slab-text-primary">{test.testNumber}</td>
                        <td className="px-4 py-4 text-sm text-slab-text-primary">{test.template.name}</td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={categoryColor}>
                            {test.template.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-slab-text-secondary">{test.project.name}</td>
                        <td className="px-4 py-4">
                          <span className={cn('inline-flex items-center gap-1 text-sm font-medium', mode.color)}>
                            <ModeIcon className="h-3 w-3" />
                            {mode.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={cn(cred.color, 'flex items-center gap-1')}>
                            <CredIcon className="h-3 w-3" />
                            {cred.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-slab-text-muted">
                          {new Date(test.createdAt).toLocaleDateString('ar-EG', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedTest(test)} className="text-slab-text-secondary hover:text-slab-accent-blue">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slab-text-secondary hover:text-slab-accent-blue">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slab-text-secondary hover:text-slab-accent-blue">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slab-text-secondary hover:text-slab-accent-red">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slab-border-glass flex items-center justify-between">
              <p className="text-sm text-slab-text-muted">إظهار {mockTests.length} من {mockTests.length} نتائج</p>
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled className="text-slab-text-muted">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled className="text-slab-text-muted">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-4 animate-fade-in">
          <div className="bg-slab-card border border-slab-border-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-slab-text-primary mb-6">إنشاء اختبار جديد</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slab-text-primary">اختر قالب الاختبار</label>
                <select className="w-full px-3 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all appearance-none">
                  <option value="marshall-stability">مارشال للثبات والتدفق (ASTM D6927)</option>
                  <option value="concrete-cube">كسر مكعبات الخرسانة (EN 12390-3)</option>
                  <option value="soil-proctor">بروكتور القياسي للتربة (ASTM D698)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slab-text-primary">المشروع (اختياري)</label>
                <select className="w-full px-3 py-2 bg-slab-border-glass border border-slab-border-glass rounded-lg text-sm text-slab-text-primary focus:ring-2 focus:ring-slab-accent-blue focus:border-transparent transition-all appearance-none">
                  <option value="">اختر مشروعاً...</option>
                  <option value="1">مشروع طريق القاهرة - الإسكندرية</option>
                  <option value="2">مشروع كوبري أكتوبر</option>
                  <option value="3">مشروع برج القاهرة الجديدة</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slab-border-glass">
              <TestModeTabs templateId="marshall-stability" projectId="1" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slab-card border border-slab-border-glass rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-up">
            <div className="flex items-center justify-between p-4 border-b border-slab-border-glass">
              <h3 className="text-lg font-bold text-slab-text-primary">{selectedTest.testNumber}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedTest(null)}
                className="text-slab-text-muted hover:text-slab-text-primary"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <TestModeTabs templateId={selectedTest.template.id} projectId="1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}