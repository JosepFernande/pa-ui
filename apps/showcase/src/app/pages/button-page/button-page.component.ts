import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { PaButton } from '@pa-ui/button';
import type { PaButtonSize, PaButtonVariant } from '@pa-ui/button';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for `pa-button` (`libs/button`): variants, sizes, colors, and states. */
@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [PaButton, CodeBlockComponent],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPageComponent {
  protected readonly variants: readonly PaButtonVariant[] = ['solid', 'outline', 'ghost'];
  protected readonly sizes: readonly PaButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly colors: readonly string[] = ['primary', 'secondary', 'success', 'error'];
}
