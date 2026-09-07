import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { HaSelect } from '@halolib-ui/select';
import type { HaSelectOption, HaSelectSize } from '@halolib-ui/select';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';

/** Showcase playground for `ha-select` (`libs/select`): sizes, states, and its `valueChange`/`opened`/`closed` outputs. */
@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [HaSelect, CodeBlockComponent],
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPageComponent {
  protected readonly sizes: readonly HaSelectSize[] = ['sm', 'md', 'lg'];

  protected readonly fruitOptions: HaSelectOption[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry (disabled)', value: 'cherry', disabled: true },
    { label: 'Date', value: 'date' },
  ];

  protected readonly selectedValue = signal<unknown>(null);
  protected readonly panelOpen = signal(false);

  protected onValueChange(value: unknown): void {
    this.selectedValue.set(value);
  }

  protected onOpened(): void {
    this.panelOpen.set(true);
  }

  protected onClosed(): void {
    this.panelOpen.set(false);
  }
}
