import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaUiComponent } from 'pa-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PaUiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pa-ui';
}
