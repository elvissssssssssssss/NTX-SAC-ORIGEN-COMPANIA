import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// ⬇️ Importa tu FooterComponent

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
