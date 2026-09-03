import { Routes } from '@angular/router';
import { ButtonPageComponent } from './pages/button-page/button-page.component';
import { InputTextPageComponent } from './pages/input-text-page/input-text-page.component';
import { InstallPageComponent } from './pages/install-page/install-page.component';
import { SelectPageComponent } from './pages/select-page/select-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'instalacion', pathMatch: 'full' },
  { path: 'instalacion', component: InstallPageComponent },
  { path: 'configuracion', component: InstallPageComponent },
  { path: 'componentes/boton', component: ButtonPageComponent },
  { path: 'componentes/input-text', component: InputTextPageComponent },
  { path: 'componentes/select', component: SelectPageComponent },
];
