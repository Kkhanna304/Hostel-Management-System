import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withPreloading, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    )
  ]
};
