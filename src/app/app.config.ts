import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { iamInterceptor } from './iam/infrastructure/iam-interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([iamInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en',
    }),
    importProvidersFrom(MatSnackBarModule),
  ],
};
