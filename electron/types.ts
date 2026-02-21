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
}

declare global {
  interface Window {
    proxyAPI: ProxyAPI;
    profileAPI: ProfileManagerAPI;
  }
}

export {};
