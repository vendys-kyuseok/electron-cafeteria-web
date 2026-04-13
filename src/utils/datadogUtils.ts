import { datadogLogs } from '@datadog/browser-logs';

export const env = import.meta.env.VITE_APP_ELECTRON_IS_DEV ? 'develop' : 'production';

export const datadogLogsInit = () => {
  if (import.meta.env.VITE_APP_ELECTRON_IS_DEV) return;
  datadogLogs.init({
    clientToken: 'pub01d57b49ce19c5794bd956c31807ea8b',
    service: `${env}-cafeteria`,
    site: 'datadoghq.com',
    env: env,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100
  });
};

export const sendDatadogLog = () => {};
