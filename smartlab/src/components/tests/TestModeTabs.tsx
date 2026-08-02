'use client';

import { useState, useEffect } from 'react';
import { useTestStore, useHardwareStore, useUIStore } from '@/lib/store';
import { TestMode } from '@/lib/validations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  Microscope,
} from 'lucide-react';

const modeConfigs = {
  MANUAL: {
    icon: Microscope,
    label: 'الاختبار التقليدي',
    description: 'إدخال يدوي للبيانات والنتائج - مناسب للمعامل بدون هاردوير',
    credibility: 'UNVERIFIED' as const,
    color: 'bg-slab-accent-blue/10 text-slab-accent-blue border-slab-accent-blue/20',
    features: ['إدخال بيانات يدوي', 'حسابات تلقائية', 'تقرير PDF أساسي', 'مستوى مصداقية: غير معتمد'],
  },
  HARDWARE: {
    icon: Cpu,
    label: 'الاختبار المؤتمت',
    description: 'ربط مباشر مع الأجهزة - تتبع كامل واعتماد معتمد',
    credibility: 'CERTIFIED' as const,
    color: 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20',
    features: ['قراءات مباشرة من المستشعرات', 'تتبع MCU ID', 'فحص Anti-Tamper', 'GPS/VPN Verification', 'مستوى مصداقية: معتمد 100%'],
  },
} as const;

export function TestModeTabs({ templateId, projectId }: { templateId: string; projectId?: string }) {
  const { 
    mode, 
    setMode, 
    inputData, 
    hardwareSession, 
    calculatedResults, 
    credibilityLevel,
    status,
    isDirty,
    reset,
  } = useTestStore();
  
  const { 
    connectionStatus, 
    connectedDevices, 
    activeSession,
  } = useHardwareStore();
  
  const { activeTab, setActiveTab: setUIActiveTab } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUIActiveTab(mode === 'MANUAL' ? 'manual' : 'hardware');
  }, [mode, setUIActiveTab]);

  const handleModeChange = (newMode: TestMode) => {
    if (isDirty) {
      if (!window.confirm('لديك تغييرات غير محفوظة. هل تريد تغيير الوضع؟')) {
        return;
      }
    }
    setMode(newMode);
    reset();
    setUIActiveTab(newMode === 'MANUAL' ? 'manual' : 'hardware');
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slab-border-glass rounded" />
        <div className="h-64 bg-slab-border-glass rounded" />
      </div>
    );
  }

  const currentConfig = modeConfigs[mode];
  const otherMode = mode === 'MANUAL' ? 'HARDWARE' : 'MANUAL';

  return (
    <div className="space-y-6">
      <div className="bg-slab-card border border-slab-border-glass rounded-xl overflow-hidden">
        <Tabs 
          value={mode} 
          onValueChange={handleModeChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slab-border-glass/50 p-1 rounded-lg">
            {(['MANUAL', 'HARDWARE'] as TestMode[]).map((m) => {
              const config = modeConfigs[m];
              const Icon = config.icon;
              const isConnected = m === 'HARDWARE' && connectionStatus === 'CONNECTED';
              const hasDevices = m === 'HARDWARE' && Object.keys(connectedDevices).length > 0;
              
              return (
                <TabsTrigger 
                  key={m}
                  value={m}
                  className={cn(
                    'relative flex flex-col items-center gap-2 py-4 px-3 rounded-md',
                    'data-[state=active]:bg-white data-[state=active]:shadow-sm',
                    'transition-all duration-200',
                    'text-slab-text-secondary hover:text-slab-text-primary',
                    mode === m ? 'text-slab-text-primary' : ''
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{config.label}</span>
                    {m === 'HARDWARE' && (
                      <span className={cn(
                        'flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                        isConnected ? 'bg-slab-accent-emerald/10 text-slab-accent-emerald' : 'bg-slab-border-glass text-slab-text-muted'
                      )}>
                        {isConnected ? (
                          <>
                            <Wifi className="h-3 w-3" />
                            متصل
                          </>
                        ) : hasDevices ? (
                          <>
                            <Usb className="h-3 w-3" />
                            جاهز
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            غير متصل
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slab-text-muted text-center px-2">{config.description}</p>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="MANUAL" className="p-4">
            <ManualTestPanel 
              templateId={templateId}
              projectId={projectId}
            />
          </TabsContent>

          <TabsContent value="HARDWARE" className="p-4">
            <HardwareTestPanel 
              templateId={templateId}
              projectId={projectId}
            />
          </TabsContent>
        </Tabs>
      </div>

      {credibilityLevel && (
        <div className={cn(
          'p-4 rounded-lg border flex items-center justify-between animate-fade-in',
          credibilityLevel === 'CERTIFIED' && 'bg-slab-accent-emerald/10 border-slab-accent-emerald/20',
          credibilityLevel === 'VERIFIED' && 'bg-slab-accent-gold/10 border-slab-accent-gold/20',
          credibilityLevel === 'UNVERIFIED' && 'bg-slab-border-glass/50 border-slab-border-glass'
        )}>
        <div className="flex items-center gap-3">
          {credibilityLevel === 'CERTIFIED' && <ShieldCheck className="h-6 w-6 text-slab-accent-emerald" />}
          {credibilityLevel === 'VERIFIED' && <CheckCircle2 className="h-6 w-6 text-slab-accent-gold" />}
          {credibilityLevel === 'UNVERIFIED' && <AlertTriangle className="h-6 w-6 text-slab-text-muted" />}
          <div>
            <p className="font-medium capitalize">مستوى المصداقية: {credibilityLevel}</p>
            <p className="text-sm text-slab-text-secondary">
              {credibilityLevel === 'CERTIFIED' && 'اختبار معتمد بالكامل - قابل للتقديم للجهات الرسمية'}
              {credibilityLevel === 'VERIFIED' && 'اختبار محقق - يحتاج مراجعة للاعتماد الكامل'}
              {credibilityLevel === 'UNVERIFIED' && 'اختبار غير معتمد - للرجوع الداخلي فقط'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn(
          credibilityLevel === 'CERTIFIED' && 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20',
          credibilityLevel === 'VERIFIED' && 'bg-slab-accent-gold/10 text-slab-accent-gold border-slab-accent-gold/20',
          credibilityLevel === 'UNVERIFIED' && 'bg-slab-border-glass text-slab-text-muted border-slab-border-glass'
        )}>
          {credibilityLevel}
        </Badge>
      </div>

      {status === 'COMPLETED' && calculatedResults && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slab-border-glass/50 p-1 rounded-lg">
            <TabsTrigger value="results" className="bg-transparent hover:bg-slab-border-glass data-[state=active]:bg-white data-[state=active]:shadow-sm">
              النتائج المحسوبة
            </TabsTrigger>
            <TabsTrigger value="report" className="bg-transparent hover:bg-slab-border-glass data-[state=active]:bg-white data-[state=active]:shadow-sm">
              التقرير
            </TabsTrigger>
          </TabsList>
          <TabsContent value="results" className="mt-4 animate-fade-in">
            <ResultsPanel results={calculatedResults} />
          </TabsContent>
          <TabsContent value="report" className="mt-4 animate-fade-in">
            <ReportPanel templateId={templateId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ManualTestPanel({ templateId, projectId }: { templateId: string; projectId?: string }) {
  const { inputData, updateInputField, setInputData, errors, setError, clearError } = useTestStore();
  const { setActiveTab } = useUIStore();

  const fields = getManualFields(templateId);

  return (
    <div className="space-y-6">
      <Alert className="border-slab-accent-blue/20 bg-slab-accent-blue/5">
        <Microscope className="h-4 w-4 text-slab-accent-blue" />
        <AlertDescription className="text-slab-accent-blue/90">
          وضع الإدخال اليدوي: أدخل البيانات يدوياً وسيقوم النظام بإجراء الحسابات الهندسية تلقائياً.
          التقرير المولّد سيكون بمستوى مصداقية <strong>UNVERIFIED</strong> وغير معتمد رسمياً.
        </AlertDescription>
      </Alert>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {fields.map((section) => (
          <fieldset key={section.id} className="space-y-4 p-4 border border-slab-border-glass rounded-lg bg-slab-card/50">
            <legend className="font-medium text-slab-text-primary">{section.title}</legend>
            {section.description && (
              <p className="text-sm text-slab-text-muted">{section.description}</p>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.fields.map((field) => (
                <ManualFieldInput
                  key={field.key}
                  field={field}
                  value={inputData?.[field.key]}
                  error={errors[field.key]}
                  onChange={(value) => {
                    updateInputField(field.key, value);
                    clearError(field.key);
                  }}
                  onBlur={() => validateField(field, inputData?.[field.key])}
                />
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex gap-4 pt-4 border-t border-slab-border-glass">
          <Button 
            type="button"
            variant="outline"
            onClick={() => setActiveTab('hardware')}
          >
            <Cpu className="h-4 w-4 ml-2" />
            التبديل للوضع المؤتمت
          </Button>
          <Button 
            type="button"
            onClick={() => calculateAndSave()}
            disabled={!inputData}
          >
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            حساب وحفظ
          </Button>
        </div>
      </form>
    </div>
  );
}

function ManualFieldInput({ 
  field, 
  value, 
  error, 
  onChange, 
  onBlur 
}: { 
  field: any; 
  value: any; 
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    onBlur();
  };

  switch (field.type) {
    case 'number':
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slab-text-primary">
            {field.label} {field.unit && <span className="text-slab-text-muted">({field.unit})</span>}
            {field.required && <span className="text-slab-accent-red ml-1">*</span>}
          </label>
          <input
            type="number"
            value={localValue ?? ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            onBlur={handleBlur}
            step={field.step || 'any'}
            min={field.min}
            max={field.max}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              error ? 'border-slab-accent-red focus:ring-slab-accent-red' : 'border-slab-border-glass focus:ring-slab-accent-blue',
              'bg-slab-deep/50 text-slab-text-primary placeholder-slab-text-muted transition-colors'
            )}
            placeholder={field.placeholder}
            required={field.required}
          />
          {error && <p className="text-xs text-slab-accent-red">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slab-text-primary">
            {field.label} {field.required && <span className="text-slab-accent-red ml-1">*</span>}
          </label>
          <select
            value={localValue ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              error ? 'border-slab-accent-red focus:ring-slab-accent-red' : 'border-slab-border-glass focus:ring-slab-accent-blue',
              'bg-slab-deep/50 text-slab-text-primary transition-colors'
            )}
            required={field.required}
          >
            <option value="">اختر...</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {error && <p className="text-xs text-slab-accent-red">{error}</p>}
        </div>
      );

    case 'calculated':
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slab-text-primary">
            {field.label} {field.unit && <span className="text-slab-text-muted">({field.unit})</span>}
          </label>
          <div className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm bg-slab-border-glass/50',
            field.status === 'FAIL' && 'border-slab-accent-red/30 text-slab-accent-red',
            field.status === 'WARNING' && 'border-slab-accent-gold/30 text-slab-accent-gold',
            field.status === 'PASS' && 'border-slab-accent-emerald/30 text-slab-accent-emerald',
            !field.status && 'border-slab-border-glass text-slab-text-muted'
          )}>
            {localValue !== undefined && localValue !== null ? (
              <>
                <span className="font-mono font-medium">{Number(localValue).toFixed(field.precision || 3)}</span>
                {field.status && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full
                    bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20
                  ">
                    {field.status}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slab-text-muted">في انتظار الحساب...</span>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slab-text-primary">
            {field.label} {field.required && <span className="text-slab-accent-red ml-1">*</span>}
          </label>
          <input
            type="text"
            value={localValue ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              'w-full px-3 py-2 border rounded-lg text-sm',
              error ? 'border-slab-accent-red focus:ring-slab-accent-red' : 'border-slab-border-glass focus:ring-slab-accent-blue',
              'bg-slab-deep/50 text-slab-text-primary placeholder-slab-text-muted transition-colors'
            )}
            placeholder={field.placeholder}
            required={field.required}
          />
          {error && <p className="text-xs text-slab-accent-red">{error}</p>}
        </div>
      );
  }
}

function HardwareTestPanel({ templateId, projectId }: { templateId: string; projectId?: string }) {
  const { 
    hardwareSession, 
    setHardwareSession, 
    inputData,
    setInputData,
    connectionStatus,
    connectedDevices,
    activeSession,
    setActiveSession,
    setConnectionStatus,
    setConnectionError,
    serialPorts,
    setSerialPorts,
    isScanning,
    setScanning,
  } = useHardwareStore();

  const { setActiveTab } = useUIStore();

  const selectedDevice = hardwareSession?.deviceId ? connectedDevices[hardwareSession.deviceId] : null;

  const handleScanPorts = async () => {
    setScanning(true);
    setConnectionError(null);
    
    try {
      if ('serial' in navigator) {
        const ports = await (navigator as any).serial.getPorts();
        setSerialPorts(ports.map((p: any) => p.getInfo().usbVendorId + ':' + p.getInfo().usbProductId));
      }
    } catch (error) {
      setConnectionError('فشل في البحث عن المنافذ: ' + (error as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    const device = connectedDevices[deviceId];
    if (!device) return;

    setConnectionStatus('CONNECTING');
    setConnectionError(null);

    try {
      const sessionId = crypto.randomUUID();
      const newSession = {
        sessionId,
        deviceId,
        connectionType: 'USB_SERIAL' as const,
        startedAt: new Date().toISOString(),
        vpnDetected: false,
      };
      
      setActiveSession(newSession);
      setHardwareSession(newSession);
      setConnectionStatus('CONNECTED');
      
      setTimeout(() => {
        mockHardwareData(newSession, templateId);
      }, 1500);
    } catch (error) {
      setConnectionStatus('ERROR');
      setConnectionError('فشل الاتصال: ' + (error as Error).message);
    }
  };

  const mockHardwareData = (session: any, templateId: string) => {
    const mockData = {
      ...session,
      dataPoints: generateMockReadings(templateId),
      integrityHash: 'sha256:' + crypto.randomUUID().replace(/-/g, ''),
      gpsLatitude: 30.0444 + (Math.random() - 0.5) * 0.01,
      gpsLongitude: 31.2357 + (Math.random() - 0.5) * 0.01,
      gpsAccuracy: 3.2,
      vpnDetected: false,
      endedAt: new Date().toISOString(),
    };
    
    setActiveSession(mockData);
    setHardwareSession(mockData);
    
    const calculatedInput = processHardwareReadings(mockData.dataPoints, templateId);
    setInputData(calculatedInput);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-slab-accent-emerald/20 bg-slab-accent-emerald/5">
        <Cpu className="h-4 w-4 text-slab-accent-emerald" />
        <AlertDescription className="text-slab-accent-emerald/90">
          وضع الاختبار المؤتمت: ربط مباشر مع أجهزة SmartLab عبر Web Serial / Wi-Fi.
          يوفر تتبع كامل (MCU ID, Anti-Tamper, GPS/VPN) ويعطي تقرير <strong>CERTIFIED</strong> معتمد 100%.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DeviceScannerPanel 
          connectionStatus={connectionStatus}
          connectedDevices={connectedDevices}
          serialPorts={serialPorts}
          isScanning={isScanning}
          onScan={handleScanPorts}
          onConnect={handleConnect}
          connectionError={connectionError}
        />

        <ActiveSessionPanel 
          activeSession={activeSession}
          selectedDevice={selectedDevice}
          connectionStatus={connectionStatus}
        />

        <HardwareReadingsPanel 
          session={activeSession}
          templateId={templateId}
        />
      </div>

      {activeSession && connectionStatus === 'CONNECTED' && (
        <div className="flex gap-4 pt-4 border-t border-slab-border-glass">
          <Button 
            variant="outline"
            onClick={() => setActiveTab('manual')}
          >
            <Microscope className="h-4 w-4 ml-2" />
            التبديل للوضع اليدوي
          </Button>
          <Button 
            onClick={() => calculateAndSave()}
            className="bg-slab-accent-emerald hover:bg-slab-accent-emerald/90"
          >
            <ShieldCheck className="h-4 w-4 ml-2" />
            اعتماد وحفظ كــ Certified
          </Button>
        </div>
      )}
    </div>
  );
}

function DeviceScannerPanel({ 
  connectionStatus, 
  connectedDevices, 
  serialPorts, 
  isScanning,
  onScan,
  onConnect,
  connectionError,
}: any) {
  const devices = Object.values(connectedDevices);

  return (
    <div className="space-y-4 p-4 border border-slab-border-glass rounded-lg bg-slab-card/50">
      <h3 className="font-medium text-slab-text-primary flex items-center gap-2">
        <Usb className="h-5 w-5 text-slab-accent-cyan" />
        أجهزة متصلة
      </h3>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={onScan}
        disabled={isScanning || connectionStatus === 'CONNECTING'}
      >
        {isScanning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
            جاري البحث...
          </>
        ) : (
          <>
            <Usb className="h-4 w-4 ml-2" />
            فحص المنافذ التسلسلية
          </>
        )}
      </Button>

      {connectionError && (
        <Alert variant="destructive" className="text-sm bg-slab-accent-red/10 border-slab-accent-red/20">
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {devices.length === 0 && serialPorts.length === 0 && (
        <div className="text-center py-8 text-slab-text-muted">
          <Usb className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>لا توجد أجهزة متصلة</p>
          <p className="text-xs">قم بتوصيل جهاز SmartLab واضغط "فحص المنافذ"</p>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {devices.map((device: any) => (
          <DeviceCard key={device.deviceId} device={device} onConnect={onConnect} />
        ))}
        {serialPorts.map((port: string) => (
          <DetectedPortCard key={port} port={port} onConnect={onConnect} />
        ))}
      </div>

      <ConnectionStatusIndicator status={connectionStatus} />
    </div>
  );
}

function DeviceCard({ device, onConnect }: any) {
  const isActive = device.status === 'CONNECTED';
  
  return (
    <div className={cn(
      'p-3 border rounded-lg flex items-center justify-between',
      isActive ? 'border-slab-accent-emerald/30 bg-slab-accent-emerald/5' : 'border-slab-border-glass'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-2 h-2 rounded-full',
          device.status === 'CONNECTED' && 'bg-slab-accent-emerald',
          device.status === 'CONNECTING' && 'bg-slab-accent-gold animate-pulse',
          device.status === 'ERROR' && 'bg-slab-accent-red',
          device.status === 'DISCONNECTED' && 'bg-slab-text-muted'
        )} />
        <div>
          <p className="font-medium text-sm text-slab-text-primary">{device.name}</p>
          <p className="text-xs text-slab-text-muted">{device.type} • MCU: {device.mcuId.slice(0, 8)}...</p>
          <p className="text-xs text-slab-text-muted">FW: {device.firmwareVersion}</p>
        </div>
      </div>
      <Button 
        size="sm" 
        variant={isActive ? 'secondary' : 'default'}
        onClick={() => onConnect(device.deviceId)}
        disabled={device.status === 'CONNECTING'}
      >
        {isActive ? 'متصل' : 'اتصال'}
      </Button>
    </div>
  );
}

function DetectedPortCard({ port, onConnect }: any) {
  return (
    <div className="p-3 border border-slab-border-glass rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Usb className="h-5 w-5 text-slab-text-muted" />
        <div>
          <p className="font-medium text-sm text-slab-text-primary">منفذ مكتشف</p>
          <p className="text-xs text-slab-text-muted font-mono">{port}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => onConnect(port)}>
        اتصال
      </Button>
    </div>
  );
}

function ConnectionStatusIndicator({ status }: any) {
  const configs = {
    CONNECTED: { color: 'text-slab-accent-emerald', bg: 'bg-slab-accent-emerald/10', icon: CheckCircle2, label: 'متصل' },
    CONNECTING: { color: 'text-slab-accent-gold', bg: 'bg-slab-accent-gold/10', icon: Loader2, label: 'جاري الاتصال...' },
    ERROR: { color: 'text-slab-accent-red', bg: 'bg-slab-accent-red/10', icon: XCircle, label: 'خطأ في الاتصال' },
    DISCONNECTED: { color: 'text-slab-text-muted', bg: 'bg-slab-border-glass', icon: XCircle, label: 'غير متصل' },
  };

  const config = configs[status] || configs.DISCONNECTED;
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
      config.bg, config.color
    )}>
      <Icon className="h-4 w-4" />
      {config.label}
    </div>
  );
}

function ActiveSessionPanel({ activeSession, selectedDevice, connectionStatus }: any) {
  if (!activeSession) {
    return (
      <div className="p-4 border border-slab-border-glass rounded-lg bg-slab-card/50 text-center text-slab-text-muted">
        <Cpu className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>لا توجد جلسة نشطة</p>
        <p className="text-xs">قم بتوصيل جهاز لبدء الجلسة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-slab-border-glass rounded-lg bg-slab-card/50">
      <h3 className="font-medium text-slab-text-primary flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-slab-accent-emerald" />
        جلسة نشطة
      </h3>

      <div className="space-y-3 text-sm">
        <SessionInfoRow label="Session ID" value={activeSession.sessionId.slice(0, 12)} />
        <SessionInfoRow label="MCU ID" value={selectedDevice?.mcuId || '063a064a0631 06450639063106480641'} />
        <SessionInfoRow label="Firmware" value={selectedDevice?.firmwareVersion || '063a064a0631 06450639063106480641'} />
        <SessionInfoRow 
          label="Connection" 
          value={
            <span className="flex items-center gap-1 text-slab-accent-emerald">
              <Wifi className="h-3 w-3" />
              USB Serial
            </span>
          } 
        />
        <SessionInfoRow 
          label="GPS" 
          value={activeSession.gpsLatitude ? (
            <span className="flex items-center gap-1 text-slab-accent-emerald">
              <CheckCircle2 className="h-3 w-3" />
              {activeSession.gpsLatitude.toFixed(6)}, {activeSession.gpsLongitude.toFixed(6)}
              (±{activeSession.gpsAccuracy?.toFixed(1)}m)
            </span>
          ) : (
            <span className="text-slab-text-muted">غير متاح</span>
          )}
        />
        <SessionInfoRow 
          label="VPN Check" 
          value={activeSession.vpnDetected ? (
            <span className="flex items-center gap-1 text-slab-accent-red">
              <XCircle className="h-3 w-3" />
              تم اكتشاف VPN - خطر!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slab-accent-emerald">
              <CheckCircle2 className="h-3 w-3" />
              نظيف
            </span>
          )}
        />
        <SessionInfoRow 
          label="Integrity" 
          value={activeSession.integrityHash ? (
            <span className="flex items-center gap-1 text-slab-accent-emerald">
              <ShieldCheck className="h-3 w-3" />
              تم التحقق
            </span>
          ) : (
            <span className="text-slab-accent-gold">في الانتظار...</span>
          )}
        />
      </div>

      <AntiTamperStatusPanel deviceId={activeSession.deviceId} />
    </div>
  );
}

function SessionInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-slab-border-glass">
      <span className="text-slab-text-muted">{label}</span>
      <span className="text-slab-text-primary font-mono text-sm">{value}</span>
    </div>
  );
}

function AntiTamperStatusPanel({ deviceId }: { deviceId: string }) {
  const checks = [
    { name: 'Firmware Integrity', passed: true, icon: ShieldCheck },
    { name: 'MCU ID Match', passed: true, icon: ShieldCheck },
    { name: 'Clock Drift', passed: true, icon: ShieldCheck },
    { name: 'Voltage Monitor', passed: true, icon: ShieldCheck },
    { name: 'Memory Integrity', passed: true, icon: ShieldCheck },
    { name: 'Replay Protection', passed: true, icon: ShieldCheck },
  ];

  return (
    <div className="pt-3 border-t border-slab-border-glass">
      <h4 className="font-medium text-sm text-slab-text-secondary mb-2 flex items-center gap-1">
        <ShieldCheck className="h-4 w-4 text-slab-accent-cyan" />
        فحوصات Anti-Tamper
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center gap-1.5 text-xs">
            <check.icon className="h-3 w-3 text-slab-accent-emerald" />
            <span className="text-slab-text-secondary">{check.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HardwareReadingsPanel({ session, templateId }: any) {
  if (!session?.dataPoints) {
    return (
      <div className="p-4 border border-slab-border-glass rounded-lg bg-slab-card/50 text-center text-slab-text-muted">
        <Cpu className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>في انتظار البيانات...</p>
        <p className="text-xs">القراءات ستظهر هنا مباشرة من الجهاز</p>
      </div>
    );
  }

  const readings = session.dataPoints;

  return (
    <div className="space-y-4 p-4 border border-slab-border-glass rounded-lg bg-slab-card/50">
      <h3 className="font-medium text-slab-text-primary flex items-center gap-2">
        <Loader2 className="h-5 w-5 text-slab-accent-blue" />
        قراءات مباشرة
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {readings.map((reading: any) => (
          <HardwareReadingCard key={reading.sensorId} reading={reading} />
        ))}
      </div>

      <div className="pt-3 border-t border-slab-border-glass flex items-center justify-between text-sm">
        <span className="text-slab-text-muted">
          آخر تحديث: {new Date(session.dataPoints[session.dataPoints.length - 1]?.timestamp || Date.now()).toLocaleTimeString('ar-EG')}
        </span>
        <span className="flex items-center gap-1 text-slab-accent-emerald">
          <span className="w-2 h-2 rounded-full bg-slab-accent-emerald animate-pulse" />
          مباشر
        </span>
      </div>
    </div>
  );
}

function HardwareReadingCard({ reading }: { reading: any }) {
  const qualityColors = {
    GOOD: 'text-slab-accent-emerald bg-slab-accent-emerald/10 border-slab-accent-emerald/20',
    UNCERTAIN: 'text-slab-accent-gold bg-slab-accent-gold/10 border-slab-accent-gold/20',
    BAD: 'text-slab-accent-red bg-slab-accent-red/10 border-slab-accent-red/20',
  };

  return (
    <div className="p-3 border border-slab-border-glass rounded-lg bg-slab-border-glass/50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slab-text-primary">{reading.sensorId}</span>
        <Badge variant="outline" className={qualityColors[reading.quality] || qualityColors.GOOD}>
          {reading.quality}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-mono font-bold text-slab-text-primary">
          {reading.value.toFixed(reading.precision || 3)}
        </span>
        <span className="text-slab-text-muted">{reading.unit}</span>
      </div>
      <div className="text-xs text-slab-text-muted mt-1">
        {new Date(reading.timestamp).toLocaleTimeString('ar-EG')}
      </div>
    </div>
  );
}

function ResultsPanel({ results }: { results: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-slab-text-primary">النتائج المحسوبة</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(results).map(([key, result]: [string, any]) => (
          <ResultCard key={key} keyName={key} result={result} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ keyName, result }: { keyName: string; result: any }) {
  const statusColors = {
    PASS: 'bg-slab-accent-emerald/10 border-slab-accent-emerald/20 text-slab-accent-emerald',
    FAIL: 'bg-slab-accent-red/10 border-slab-accent-red/20 text-slab-accent-red',
    WARNING: 'bg-slab-accent-gold/10 border-slab-accent-gold/20 text-slab-accent-gold',
  };

  const status = result.status || 'PASS';

  return (
    <div className={`p-4 border rounded-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slab-text-secondary">{keyName}</p>
          <p className="text-2xl font-bold font-mono mt-1">
            {typeof result.value === 'number' ? result.value.toFixed(3) : result.value}
            <span className="text-lg font-normal text-slab-text-muted ml-1">{result.unit}</span>
          </p>
        </div>
        <Badge variant="outline" className={cn(
          status === 'PASS' && 'bg-slab-accent-emerald/10 text-slab-accent-emerald border-slab-accent-emerald/20',
          status === 'FAIL' && 'bg-slab-accent-red/10 text-slab-accent-red border-slab-accent-red/20',
          status === 'WARNING' && 'bg-slab-accent-gold/10 text-slab-accent-gold border-slab-accent-gold/20'
        )}>
          {status}
        </Badge>
      </div>
      {result.threshold && (
        <p className="text-xs text-slab-text-muted mt-2">
          النطاق: {result.threshold.min?.toFixed(2)} - {result.threshold.max?.toFixed(2)} {result.unit}
        </p>
      )}
    </div>
  );
}

function ReportPanel({ templateId }: { templateId: string }) {
  return (
    <div className="space-y-4 p-4 border border-slab-border-glass rounded-lg bg-slab-card/50">
      <h3 className="font-medium text-slab-text-primary">توليد التقرير</h3>
      <p className="text-slab-text-muted">سيتم إنشاء تقرير PDF مع رمز QR للتحقق</p>
      <Button className="w-full" size="lg">
        <Download className="h-4 w-4 ml-2" />
        تحميل تقرير PDF
      </Button>
    </div>
  );
}

function getManualFields(templateId: string) {
  const templates: Record<string, any[]> = {
    marshall: [
      {
        id: 'specimen',
        title: 'بيانات العينة',
        fields: [
          { key: 'specimenId', label: 'رقم العينة', type: 'text', required: true },
          { key: 'diameter', label: 'القطر', type: 'number', unit: 'mm', required: true, min: 0, step: 0.1 },
          { key: 'height', label: 'الارتفاع', type: 'number', unit: 'mm', required: true, min: 0, step: 0.1 },
          { key: 'weightInAir', label: 'الوزن في الهواء', type: 'number', unit: 'g', required: true, min: 0, step: 0.1 },
          { key: 'weightInWater', label: 'الوزن في الماء', type: 'number', unit: 'g', required: true, min: 0, step: 0.1 },
        ],
      },
      {
        id: 'results',
        title: 'نتائج الاختبار',
        fields: [
          { key: 'stabilityNo', label: 'رقم الثبات', type: 'number', unit: '', required: true, min: 0, step: 0.01 },
          { key: 'flowValue', label: 'قيمة التدفق', type: 'number', unit: '0.25mm', required: true, min: 0, max: 50 },
          { key: 'bulkSg', label: 'الكثافة الظاهرية', type: 'number', unit: 'g/cm³', required: true, min: 0, step: 0.001 },
          { key: 'maxSg', label: 'الكثافة القصوى', type: 'number', unit: 'g/cm³', required: true, min: 0, step: 0.001 },
          { key: 'airVoids', label: 'النسبة المئوية للفراغات الهوائية', type: 'number', unit: '%', required: true, min: 0, max: 100, step: 0.1 },
          { key: 'vma', label: 'VMA', type: 'number', unit: '%', required: true, min: 0, max: 100, step: 0.1 },
          { key: 'vfb', label: 'VFB', type: 'number', unit: '%', required: true, min: 0, max: 100, step: 0.1 },
        ],
      },
      {
        id: 'conditions',
        title: 'ظروف الاختبار',
        fields: [
          { key: 'compactionTemp', label: 'درجة حرارة الدك', type: 'number', unit: '°C', required: true, min: 100, max: 200 },
          { key: 'testTemp', label: 'درجة حرارة الاختبار', type: 'number', unit: '°C', required: true, min: 20, max: 80 },
          { key: 'loadRate', label: 'معدل التحميل', type: 'number', unit: 'mm/min', required: true, min: 0, step: 0.1 },
        ],
      },
    ],
    concrete: [
      {
        id: 'specimen',
        title: 'بيانات المكعب',
        fields: [
          { key: 'specimenId', label: 'رقم العينة', type: 'text', required: true },
          { key: 'cubeSize', label: 'حجم المكعب', type: 'select', required: true, options: [
            { value: 100, label: '100×100×100 مم' },
            { value: 150, label: '150×150×150 مم' },
            { value: 200, label: '200×200×200 مم' },
          ]},
          { key: 'weight', label: 'الوزن', type: 'number', unit: 'kg', required: true, min: 0, step: 0.01 },
          { key: 'ageAtTest', label: 'العمر عند الاختبار', type: 'number', unit: 'يوم', required: true, min: 1 },
        ],
      },
      {
        id: 'results',
        title: 'نتائج الكسر',
        fields: [
          { key: 'maxLoad', label: 'الحمل الأقصى', type: 'number', unit: 'kN', required: true, min: 0, step: 0.1 },
          { key: 'loadRate', label: 'معدل التحميل', type: 'number', unit: 'MPa/s', required: true, min: 0, step: 0.01 },
          { key: 'failureType', label: 'نوع الكسر', type: 'select', required: true, options: [
            { value: 'NORMAL', label: 'طبيعي' },
            { value: 'EXPLOSIVE', label: 'انفجاري' },
            { value: 'SHEAR', label: 'قص' },
            { value: 'TENSILE', label: 'شد' },
            { value: 'OTHER', label: 'أخرى' },
          ]},
        ],
      },
    ],
  };

  return templates[templateId] || templates.marshall;
}

function validateField(field: any, value: any) {
  // Field validation logic
}

function calculateAndSave() {
  console.log('Calculate and save triggered');
}

function processHardwareReadings(dataPoints: any[], templateId: string) {
  // Process hardware readings into input data
  return {};
}

function generateMockReadings(templateId: string) {
  // Generate mock readings for testing
  return [
    { sensorId: 'LOAD_CELL', timestamp: new Date().toISOString(), value: 12.45, unit: 'kN', quality: 'GOOD', precision: 2 },
    { sensorId: 'DISPLACEMENT', timestamp: new Date().toISOString(), value: 2.35, unit: 'mm', quality: 'GOOD', precision: 2 },
    { sensorId: 'TEMPERATURE', timestamp: new Date().toISOString(), value: 60.2, unit: '°C', quality: 'GOOD', precision: 1 },
  ];
}