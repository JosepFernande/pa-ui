import { Routes } from '@angular/router';
import { ButtonPageComponent } from './pages/button-page/button-page.component';
import { InputPageComponent } from './pages/input-page/input-page.component';
import { SelectPageComponent } from './pages/select-page/select-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'button', pathMatch: 'full' },
  { path: 'button', component: ButtonPageComponent },
  { path: 'input', component: InputPageComponent },
  { path: 'select', component: SelectPageComponent },
];
