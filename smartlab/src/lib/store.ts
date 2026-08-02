import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { TestMode, TestInput, MarshallInput, HardwareSessionInput, CredibilityLevel } from '@/lib/validations';

interface TestFormState {
  testId: string | null;
  templateId: string | null;
  projectId: string | null;
  mode: TestMode;
  inputData: MarshallInput | Record<string, unknown> | null;
  hardwareSession: HardwareSessionInput | null;
  calculatedResults: Record<string, unknown> | null;
  credibilityLevel: CredibilityLevel | null;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  isDirty: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  
  setTestId: (id: string | null) => void;
  setTemplateId: (id: string) => void;
  setProjectId: (id: string | null) => void;
  setMode: (mode: TestMode) => void;
  setInputData: (data: MarshallInput | Record<string, unknown>) => void;
  updateInputField: <K extends string>(field: K, value: unknown) => void;
  setHardwareSession: (session: HardwareSessionInput | null) => void;
  setCalculatedResults: (results: Record<string, unknown>) => void;
  setCredibilityLevel: (level: CredibilityLevel) => void;
  setStatus: (status: TestFormState['status']) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  setWarning: (field: string, message: string) => void;
  clearWarnings: () => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
  loadFromTest: (test: TestInput) => void;
}

const initialState = {
  testId: null,
  templateId: null,
  projectId: null,
  mode: 'MANUAL' as TestMode,
  inputData: null,
  hardwareSession: null,
  calculatedResults: null,
  credibilityLevel: null,
  status: 'DRAFT' as const,
  isDirty: false,
  errors: {},
  warnings: {},
};

export const useTestStore = create<TestFormState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setTestId: (testId) => set({ testId }),
        
        setTemplateId: (templateId) => set({ templateId }),
        
        setProjectId: (projectId) => set({ projectId }),
        
        setMode: (mode) => set({ mode, isDirty: true }),
        
        setInputData: (inputData) => set({ inputData, isDirty: true }),
        
        updateInputField: (field, value) => 
          set((state) => ({
            inputData: state.inputData ? { ...state.inputData, [field]: value } : { [field]: value },
            isDirty: true,
            errors: { ...state.errors, [field]: '' },
          })),
        
        setHardwareSession: (hardwareSession) => set({ hardwareSession, isDirty: true }),
        
        setCalculatedResults: (calculatedResults) => set({ calculatedResults }),
        
        setCredibilityLevel: (credibilityLevel) => set({ credibilityLevel }),
        
        setStatus: (status) => set({ status }),
        
        setError: (field, message) => 
          set((state) => ({ 
            errors: { ...state.errors, [field]: message } 
          })),
        
        clearError: (field) => 
          set((state) => {
            const { [field]: _, ...rest } = state.errors;
            return { errors: rest };
          }),
        
        setWarning: (field, message) => 
          set((state) => ({ 
            warnings: { ...state.warnings, [field]: message } 
          })),
        
        clearWarnings: () => set({ warnings: {} }),
        
        markDirty: () => set({ isDirty: true }),
        
        markClean: () => set({ isDirty: false }),
        
        reset: () => set(initialState),
        
        loadFromTest: (test) => set({
          testId: test.testNumber,
          templateId: test.templateId,
          projectId: test.projectId,
          mode: test.mode,
          inputData: test.inputData as MarshallInput | Record<string, unknown>,
          hardwareSession: test.hardwareSessionId ? {
            sessionId: test.hardwareSessionId || '',
            deviceId: test.hardwareDeviceId || '',
            connectionType: 'USB_SERIAL',
            startedAt: new Date().toISOString(),
          } : null,
          calculatedResults: test.calculatedResults as Record<string, unknown> | null,
          credibilityLevel: test.credibilityLevel,
          status: test.status,
          isDirty: false,
          errors: {},
          warnings: {},
        }),
      }),
      {
        name: 'test-form-storage',
        partialize: (state) => ({
          templateId: state.templateId,
          projectId: state.projectId,
          mode: state.mode,
          inputData: state.inputData,
          hardwareSession: state.hardwareSession,
        }),
      }
    ),
    { name: 'TestFormStore' }
  )
);

interface HardwareState {
  connectedDevices: Record<string, {
    deviceId: string;
    name: string;
    type: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
    lastSeen: string;
    firmwareVersion: string;
    mcuId: string;
  }>;
  activeSession: HardwareSessionInput | null;
  connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  connectionError: string | null;
  serialPorts: string[];
  isScanning: boolean;
  
  addDevice: (device: HardwareState['connectedDevices'][string]) => void;
  removeDevice: (deviceId: string) => void;
  updateDeviceStatus: (deviceId: string, status: HardwareState['connectedDevices'][string]['status']) => void;
  setActiveSession: (session: HardwareSessionInput | null) => void;
  setConnectionStatus: (status: HardwareState['connectionStatus']) => void;
  setConnectionError: (error: string | null) => void;
  setSerialPorts: (ports: string[]) => void;
  setScanning: (scanning: boolean) => void;
  reset: () => void;
}

const hardwareInitialState = {
  connectedDevices: {},
  activeSession: null,
  connectionStatus: 'DISCONNECTED' as const,
  connectionError: null,
  serialPorts: [],
  isScanning: false,
};

export const useHardwareStore = create<HardwareState>()(
  devtools(
    (set) => ({
      ...hardwareInitialState,
      
      addDevice: (device) => 
        set((state) => ({
          connectedDevices: {
            ...state.connectedDevices,
            [device.deviceId]: device,
          },
        })),
      
      removeDevice: (deviceId) => 
        set((state) => {
          const { [deviceId]: _, ...rest } = state.connectedDevices;
          return { connectedDevices: rest };
        }),
      
      updateDeviceStatus: (deviceId, status) => 
        set((state) => ({
          connectedDevices: {
            ...state.connectedDevices,
            [deviceId]: {
              ...state.connectedDevices[deviceId],
              status,
              lastSeen: new Date().toISOString(),
            },
          },
        })),
      
      setActiveSession: (activeSession) => set({ activeSession }),
      
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      
      setConnectionError: (connectionError) => set({ connectionError }),
      
      setSerialPorts: (serialPorts) => set({ serialPorts }),
      
      setScanning: (isScanning) => set({ isScanning }),
      
      reset: () => set(hardwareInitialState),
    }),
    { name: 'HardwareStore' }
  )
);

interface UIState {
  activeTab: 'manual' | 'hardware' | 'results' | 'report';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  modals: Record<string, boolean>;
  
  setActiveTab: (tab: UIState['activeTab']) => void;
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        activeTab: 'manual',
        sidebarOpen: true,
        theme: 'system',
        notifications: [],
        modals: {},
        
        setActiveTab: (activeTab) => set({ activeTab }),
        
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        setTheme: (theme) => set({ theme }),
        
        addNotification: (notification) => 
          set((state) => ({
            notifications: [
              ...state.notifications,
              { ...notification, id: crypto.randomUUID() },
            ],
          })),
        
        removeNotification: (id) => 
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        
        openModal: (id) => 
          set((state) => ({ modals: { ...state.modals, [id]: true } })),
        
        closeModal: (id) => 
          set((state) => {
            const { [id]: _, ...rest } = state.modals;
            return { modals: rest };
          }),
        
        closeAllModals: () => set({ modals: {} }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    ),
    { name: 'UIStore' }
  )
);