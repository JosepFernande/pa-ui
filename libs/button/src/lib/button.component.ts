import {
  Component,
  OnInit,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { withFocusMonitor } from '@halo-ui/core';
import type { HaButtonVariant, HaButtonSize } from './button.types';

@Component({
  selector: 'button[ha-button]',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[disabled]': 'effectiveDisabled()',
    '[attr.aria-disabled]': 'effectiveDisabled()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.type]': 'type()',
    '[style.--ha-button-color]': 'colorVar()',
    '[style.--ha-button-bg]': 'colorVar()',
    '[style.--ha-button-hover-bg]': 'hoverVar()',
    '[style.--ha-button-active-bg]': 'activeVar()',
    '[style.--ha-button-solid-color]': 'contrastVar()',
  },
})
export class HaButton implements OnInit {
  /** Visual variant: solid (filled), outline (bordered), or ghost (transparent). */
  readonly variant = input<HaButtonVariant>('solid');

  /** Size preset: sm, md, or lg. */
  readonly size = input<HaButtonSize>('md');

  /** Theme-registered color name used to resolve --ha-button-color. */
  readonly color = input('primary');

  /** Whether the button is disabled. Overridden by loading. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether the button shows a loading spinner. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Native button type: button, submit, or reset. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** CDK focus origin signal (keyboard, mouse, touch, program, or null). */
  protected readonly focusOrigin = signal<FocusOrigin>(null);

  private readonly destroyRef = inject(DestroyRef);

  /** Computed: disabled OR loading — drives the native disabled attribute. */
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.loading());

  /** Computed: BEM class string for the host element. */
  protected readonly hostClasses = computed(() => {
    const classes = ['ha-button'];
    classes.push(`ha-button--${this.variant()}`);
    classes.push(`ha-button--${this.size()}`);
    if (this.effectiveDisabled()) {
      classes.push('ha-button--disabled');
    }
    if (this.loading()) {
      classes.push('ha-button--loading');
    }
    if (this.focusOrigin() === 'keyboard') {
      classes.push('cdk-keyboard-focused');
    }
    return classes.join(' ');
  });

  /** Computed: CSS custom property value resolving the color input. */
  protected readonly colorVar = computed(() => `var(--ha-${this.color()})`);

  /** Computed: CSS custom property value resolving the color's hover variant. */
  protected readonly hoverVar = computed(() => `var(--ha-${this.color()}-hover)`);

  /** Computed: CSS custom property value resolving the color's active variant. */
  protected readonly activeVar = computed(() => `var(--ha-${this.color()}-active)`);

  /** Computed: CSS custom property value resolving the color's contrast variant. */
  protected readonly contrastVar = computed(() => `var(--ha-${this.color()}-contrast)`);

  constructor(
    private readonly focusMonitor: FocusMonitor,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    withFocusMonitor(this.elementRef, this.focusMonitor, this.destroyRef, this.focusOrigin);
  }
}
