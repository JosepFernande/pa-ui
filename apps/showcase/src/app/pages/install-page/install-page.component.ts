import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for the install & setup guide: package install, theme provider, Foundation CSS import, and first component usage. */
@Component({
  selector: 'app-install-page',
  standalone: true,
  imports: [RouterLink, CodeBlockComponent],
  templateUrl: './install-page.component.html',
  styleUrl: './install-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallPageComponent {}
