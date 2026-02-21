/// <reference types="vite/client" />

export interface Profile {
  id: string;
  name: string;
  host: string;
  port: string;
  httpEnabled: boolean;
  socksEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ExportData {
  version: string;
  exportedAt: number;
  profiles: Profile[];
}

export interface SystemProxyConfig {
  host: string;
  port: string;
  httpEnabled: boolean;
  socksEnabled: boolean;
}

export interface NetworkChangeData {
  profileId: string;
  profileName: string;
  host: string;
  port: string;
  httpEnabled: boolean;
  socksEnabled: boolean;
}

export interface ProxyAPI {
  toggle: (host: string, port: string, currentState: string, httpEnabled: boolean, socksEnabled: boolean) => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<string>;
  getConfig: () => Promise<{
    host: string;
    port: string;
    httpEnabled: boolean;
    socksEnabled: boolean
  }>;
  onProxyStatusChange: (callback: (status: string) => void) => void;
  removeProxyStatusChangeListener: () => void;
}

export interface ProfileManagerAPI {
  getProfiles: () => Promise<Profile[]>;
  saveProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Profile>;
  updateProfile: (id: string, profile: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<boolean>;
  setActiveProfile: (id: string) => Promise<void>;
  getActiveProfile: () => Promise<Profile | null>;
  exportProfiles: () => Promise<ExportData>;
  importProfiles: (data: ExportData) => Promise<number>;
  detectSystemProxy: () => Promise<SystemProxyConfig | null>;
}

export interface AutomationAPI {
  startNetworkMonitoring: () => Promise<{ success: boolean }>;
  stopNetworkMonitoring: () => Promise<{ success: boolean }>;
  setLastActiveProfile: (profileId: string | null) => Promise<{ success: boolean }>;
  getLastActiveProfile: () => Promise<{ profileId: string | null }>;
  setLaunchAtLogin: (enable: boolean) => Promise<{ success: boolean; enabled: boolean }>;
  getLaunchAtLogin: () => Promise<{ enabled: boolean }>;
  onNetworkChange: (callback: (data: NetworkChangeData) => void) => void;
  removeNetworkChangeListener: () => void;
}

export interface RulesAPI {
  getAll: () => Promise<string[]>;
  save: (rules: string[]) => Promise<{ success: boolean }>;
  setEnabled: (enabled: boolean) => Promise<{ success: boolean }>;
  getEnabled: () => Promise<boolean>;
  generatePAC: (rules: string[], proxyHost: string, proxyPort: string) => Promise<{ success: boolean; pacPath?: string; error?: string }>;
}

declare global {
  interface Window {
    proxyAPI: ProxyAPI;
    profileAPI: ProfileManagerAPI;
    automationAPI: AutomationAPI;
    rulesAPI: RulesAPI;
  }
}
