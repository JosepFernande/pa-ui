import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaInput } from '@pa-ui/input';
import type { PaInputSize } from '@pa-ui/input';

/** Showcase playground for `pa-input` (`libs/input`): sizes, states, and `[(ngModel)]` binding. */
@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [FormsModule, PaInput],
  templateUrl: './input-page.component.html',
  styleUrl: './input-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPageComponent {
  protected readonly sizes: readonly PaInputSize[] = ['sm', 'md', 'lg'];

  /**
   * Plain (non-signal) field: `[(ngModel)]` owns this value through the form
   * directive, mirroring the idiomatic template-driven-forms pattern rather
   * than wrapping a value that Angular forms already manages.
   */
  protected boundValue = '';
}
