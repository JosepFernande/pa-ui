import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HaInputText } from '@halolib-ui/input-text';
import type { HaInputTextSize } from '@halolib-ui/input-text';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for `ha-input-text` (`libs/input-text`): sizes, states, and `[(ngModel)]` binding. */
@Component({
  selector: 'app-input-text-page',
  standalone: true,
  imports: [FormsModule, HaInputText, CodeBlockComponent],
  templateUrl: './input-text-page.component.html',
  styleUrl: './input-text-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextPageComponent {
  protected readonly sizes: readonly HaInputTextSize[] = ['sm', 'md', 'lg'];

  /**
   * Plain (non-signal) field: `[(ngModel)]` owns this value through the form
   * directive, mirroring the idiomatic template-driven-forms pattern rather
   * than wrapping a value that Angular forms already manages.
   */
  protected boundValue = '';
}
