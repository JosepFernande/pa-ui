import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { PaSelect } from '@pa-ui/select';
import type { PaSelectOption, PaSelectSize } from '@pa-ui/select';

/** Showcase playground for `pa-select` (`libs/select`): sizes, states, and its `valueChange`/`opened`/`closed` outputs. */
@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [PaSelect],
  templateUrl: './select-page.component.html',
  styleUrl: './select-page.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPageComponent {
  protected readonly sizes: readonly PaSelectSize[] = ['sm', 'md', 'lg'];

  protected readonly fruitOptions: PaSelectOption[] = [
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
