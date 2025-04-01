// Global tip tanımlamaları
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (options: any) => Promise<void>;
      calendar: {
        events: {
          insert: (options: any) => Promise<any>;
          list: (options: any) => Promise<any>;
        };
      };
    };
    auth2: {
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        signIn: () => Promise<any>;
        signOut: () => Promise<any>;
      };
    };
  };
  
  IyzipayCheckout: {
    open: (options: any) => void;
  };

  fs?: {
    readFile: (filepath: string, options?: { encoding?: string }) => Promise<Uint8Array | string>;
  };
}