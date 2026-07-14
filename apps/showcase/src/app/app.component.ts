import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaUiComponent } from '@pa-ui/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PaUiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'pa-ui';
}
