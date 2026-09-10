import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';

const PRISM_LANGUAGE_ALIASES: Record<string, string> = {
  html: 'markup',
};

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
  private readonly sanitizer = inject(DomSanitizer);

  readonly label = input.required<string>();
  readonly language = input.required<string>();
  readonly code = input.required<string>();

  protected readonly copied = signal(false);

  protected readonly highlightedCode = computed<SafeHtml>(() => {
    const grammarName = PRISM_LANGUAGE_ALIASES[this.language()] ?? this.language();
    const grammar = Prism.languages[grammarName];
    const html = grammar
      ? Prism.highlight(this.code(), grammar, grammarName)
      : Prism.util.encode(this.code());
    return this.sanitizer.bypassSecurityTrustHtml(html as string);
  });

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
