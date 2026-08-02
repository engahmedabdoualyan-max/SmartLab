'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FlaskConical, Cpu, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Loader2, Microscope } from 'lucide-react';

export function TestModeTabsSimple({ templateId, projectId }: { templateId: string; projectId?: string }) {
  const [mode, setMode] = useState<'MANUAL' | 'HARDWARE'>('MANUAL');
  const [mounted, setMounted] = useState(false);
  const [credibilityLevel, setCredibilityLevel] = useState<'CERTIFIED' | 'VERIFIED' | 'UNVERIFIED'>('UNVERIFIED');
  const [status, setStatus] = useState<'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'>('DRAFT');

  useEffect(() => { setMounted(true); }, []);

  const handleModeChange = (newMode: 'MANUAL' | 'HARDWARE') => {
    setMode(newMode);
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="MANUAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                <span className="font-medium text-sm">اليدوي</span>
              </div>
              <p className="text-xs text-gray-500 text-center px-2">إدخال يدوي</p>
            </TabsTrigger>
            <TabsTrigger value="HARDWARE" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                <span className="font-medium text-sm">المؤتمت</span>
              </div>
              <p className="text-xs text-gray-500 text-center px-2">ربط مباشر</p>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="MANUAL" className="p-4">
            <Alert className="border-blue-200 bg-blue-50">
              <FlaskConical className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                وضع الإدخال اليدوي - مستوى مصداقية <strong>UNVERIFIED</strong>
              </AlertDescription>
            </Alert>
            <Button onClick={() => { setStatus('COMPLETED'); setCredibilityLevel('UNVERIFIED'); }}>
              حساب وحفظ
            </Button>
          </TabsContent>

          <TabsContent value="HARDWARE" className="p-4">
            <Alert className="border-green-200 bg-green-50">
              <Cpu className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                وضع المؤتمت - مستوى مصداقية <strong>CERTIFIED</strong>
              </AlertDescription>
            </Alert>
            <Button onClick={() => { setStatus('COMPLETED'); setCredibilityLevel('CERTIFIED'); }}>
              اعتماد وحفظ
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {credibilityLevel && (
        <div className="p-4 rounded-lg border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {credibilityLevel === 'CERTIFIED' && <ShieldCheck className="h-6 w-6 text-green-600" />}
            {credibilityLevel === 'VERIFIED' && <CheckCircle2 className="h-6 w-6 text-yellow-600" />}
            {credibilityLevel === 'UNVERIFIED' && <AlertTriangle className="h-6 w-6 text-gray-600" />}
            <div>
              <p className="font-medium capitalize">مستوى المصداقية: {credibilityLevel}</p>
            </div>
          </div>
          <Badge variant="outline">{credibilityLevel}</Badge>
        </div>
      )}

      {status === 'COMPLETED' && (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h3 className="font-medium text-gray-900">النتائج المحسوبة</h3>
          <p className="text-gray-500 mt-2">تم إكمال الاختبار بنجاح</p>
        </div>
      )}
    </div>
  );
}
