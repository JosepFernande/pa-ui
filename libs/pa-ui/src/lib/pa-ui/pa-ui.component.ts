import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pa-pa-ui',
  standalone: true,
  templateUrl: './pa-ui.component.html',
  styleUrl: './pa-ui.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaUiComponent {}
