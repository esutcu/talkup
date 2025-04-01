// Global tip tanımlamaları
// Bu dosya, TypeScript'e pencere nesnesi üzerinde ek özellikleri bildirmektedir

// Google API tiplerini tanımla
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
  
  // Iyzipay tiplerini tanımla
  IyzipayCheckout: {
    open: (options: any) => void;
  };
}