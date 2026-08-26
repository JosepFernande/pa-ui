import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';

/** Labeled, copy-to-clipboard code snippet used by each component doc page (Instalación / Importación / Uso básico). */
@Component({
  selector: 'app-code-block',
  standalone: true,
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input.required<string>();
  readonly language = input.required<string>();
  readonly code = input.required<string>();

  protected readonly copied = signal(false);

  protected copy(): void {
    navigator.clipboard
      .writeText(this.code())
      .then(() => {
        this.copied.set(true);
        const timeoutId = setTimeout(() => this.copied.set(false), 1500);
        this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
      })
      .catch(() => {
        this.copied.set(false);
      });
  }
}
