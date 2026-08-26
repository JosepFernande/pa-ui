import { Routes } from '@angular/router';
import { ButtonPageComponent } from './pages/button-page/button-page.component';
import { InputPageComponent } from './pages/input-page/input-page.component';
import { InstallPageComponent } from './pages/install-page/install-page.component';
import { SelectPageComponent } from './pages/select-page/select-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'instalacion', pathMatch: 'full' },
  { path: 'instalacion', component: InstallPageComponent },
  { path: 'configuracion', component: InstallPageComponent },
  { path: 'componentes/boton', component: ButtonPageComponent },
  { path: 'componentes/input-text', component: InputPageComponent },
  { path: 'componentes/select', component: SelectPageComponent },
];
