import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { HaButton } from '@halolib-ui/button';
import type { HaButtonSize, HaButtonVariant } from '@halolib-ui/button';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for `ha-button` (`libs/button`): variants, sizes, colors, and states. */
@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [HaButton, CodeBlockComponent],
  templateUrl: './button-page.component.html',
  styleUrl: './button-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPageComponent {
  protected readonly variants: readonly HaButtonVariant[] = ['solid', 'outline', 'ghost'];
  protected readonly sizes: readonly HaButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly colors: readonly string[] = ['primary', 'success', 'error'];
}
