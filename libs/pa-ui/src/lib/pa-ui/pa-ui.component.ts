import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pa-pa-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pa-ui.component.html',
  styleUrl: './pa-ui.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaUiComponent {}
