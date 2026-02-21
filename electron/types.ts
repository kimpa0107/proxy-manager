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

declare global {
  interface Window {
    proxyAPI: ProxyAPI;
  }
}

export {};
