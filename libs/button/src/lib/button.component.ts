import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  computed,
  input,
  signal,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import type { PaButtonVariant, PaButtonSize } from './button.types';

@Component({
  selector: 'button[pa-button]',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[disabled]': 'effectiveDisabled()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.type]': 'type()',
    '[style.--pa-button-color]': 'colorVar()',
  },
})
export class PaButton implements OnInit, OnDestroy {
  /** Visual variant: solid (filled), outline (bordered), or ghost (transparent). */
  readonly variant = input<PaButtonVariant>('solid');

  /** Size preset: sm, md, or lg. */
  readonly size = input<PaButtonSize>('md');

  /** Theme-registered color name used to resolve --pa-button-color. */
  readonly color = input('primary');

  /** Whether the button is disabled. Overridden by loading. */
  readonly disabled = input(false);

  /** Whether the button shows a loading spinner. */
  readonly loading = input(false);

  /** Native button type: button, submit, or reset. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** CDK focus origin signal (keyboard, mouse, touch, program, or null). */
  protected readonly focusOrigin = signal<FocusOrigin>(null);

  /** Computed: disabled OR loading — drives the native disabled attribute. */
  protected readonly effectiveDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  /** Computed: BEM class string for the host element. */
  protected readonly hostClasses = computed(() => {
    const classes = ['pa-button'];
    classes.push(`pa-button--${this.variant()}`);
    classes.push(`pa-button--${this.size()}`);
    if (this.effectiveDisabled()) {
      classes.push('pa-button--disabled');
    }
    if (this.loading()) {
      classes.push('pa-button--loading');
    }
    if (this.focusOrigin() === 'keyboard') {
      classes.push('cdk-keyboard-focused');
    }
    return classes.join(' ');
  });

  /** Computed: CSS custom property value resolving the color input. */
  protected readonly colorVar = computed(
    () => `var(--pa-${this.color()})`,
  );

  constructor(
    private readonly focusMonitor: FocusMonitor,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.focusMonitor
      .monitor(this.elementRef.nativeElement, true)
      .subscribe((origin) => {
        this.focusOrigin.set(origin);
      });
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }
}
