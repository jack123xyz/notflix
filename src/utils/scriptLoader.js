export class ExternalScriptLoader {
  constructor() {
    this.loadingScripts = new Map();
  }

  async loadScript(src, globalVariable, timeout = 10000) {
    if (window[globalVariable]) {
      return Promise.resolve();
    }

    if (this.loadingScripts.has(src)) {
      return this.loadingScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;

      const timeoutId = setTimeout(() => {
        reject(new Error(`Script loading timeout: ${src}`));
      }, timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        const checkGlobal = () => {
          if (window[globalVariable]) {
            resolve();
          } else {
            setTimeout(checkGlobal, 50);
          }
        };
        checkGlobal();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });

    this.loadingScripts.set(src, promise);
    return promise;
  }

  async loadYouTubeAPI() {
    return this.loadScript("https://www.youtube.com/iframe_api", "YT", 15000);
  }
}

export const scriptLoader = new ExternalScriptLoader();
