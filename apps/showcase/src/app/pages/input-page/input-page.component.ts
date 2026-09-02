import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HaInput } from '@halo-ui/input';
import type { HaInputSize } from '@halo-ui/input';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for `ha-input` (`libs/input`): sizes, states, and `[(ngModel)]` binding. */
@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [FormsModule, HaInput, CodeBlockComponent],
  templateUrl: './input-page.component.html',
  styleUrl: './input-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPageComponent {
  protected readonly sizes: readonly HaInputSize[] = ['sm', 'md', 'lg'];

  /**
   * Plain (non-signal) field: `[(ngModel)]` owns this value through the form
   * directive, mirroring the idiomatic template-driven-forms pattern rather
   * than wrapping a value that Angular forms already manages.
   */
  protected boundValue = '';
}
