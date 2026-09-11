import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { HA_ICON_SIZE_SCALE } from '@halolib-ui/angular/core';
import { HA_ICON_REGISTRY } from './icon.registry';
import type { HaIconName } from './icon.registry';
import type { HaIconSize } from './icon.types';

/**
 * Numeric pixel sizes for each `HaIconSize` step, derived from
 * `HA_ICON_SIZE_SCALE` (the single source of truth for icon sizing shared
 * with every other themed component in this library).
 */
const HA_ICON_SIZE_PX: Record<HaIconSize, number> = {
  sm: parseInt(HA_ICON_SIZE_SCALE.sm, 10),
  md: parseInt(HA_ICON_SIZE_SCALE.md, 10),
  lg: parseInt(HA_ICON_SIZE_SCALE.lg, 10),
};

/**
 * Themed icon (custom element `ha-icon`, not an attribute selector) wrapping
 * `@lucide/angular`. Consumers select an icon by name (`HaIconName`, a
 * curated `HA_ICON_REGISTRY` of kebab-case Lucide slugs) rather than
 * importing a Lucide icon component directly — this is what lets the
 * underlying icon set be swapped later without a breaking change.
 *
 * `@lucide/angular` ships each icon as its OWN Angular component with a
 * per-icon attribute selector (e.g. `svg[lucideArrowRight]`), not a single
 * dynamic-by-name renderer, so resolving `name` to a component at runtime is
 * done here via `NgComponentOutlet` rather than a static `[lucideIcon]`
 * binding.
 *
 * Decorative by default (`aria-hidden="true"`, no `role`) — pass `ariaLabel`
 * to expose the icon to assistive tech (`role="img"` + `aria-label`).
 * Stroke color is left at Lucide's default (`currentColor`) so icons inherit
 * color the same way every other themed component here does.
 */
@Component({
  selector: 'ha-icon',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './icon.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
})
export class HaIcon {
  /** Icon to render, looked up in `HA_ICON_REGISTRY`. */
  readonly name = input.required<HaIconName>();

  /** Size preset: sm (20px), md (24px), or lg (32px). */
  readonly size = input<HaIconSize>('md');

  /** Accessible label. Empty (default) renders the icon as decorative. */
  readonly ariaLabel = input<string>('');

  /** Computed: the Lucide icon component resolved from `name`. */
  protected readonly resolvedIcon = computed(() => HA_ICON_REGISTRY[this.name()]);

  /** Computed: numeric pixel size resolved from `size`. */
  protected readonly sizePx = computed(() => HA_ICON_SIZE_PX[this.size()]);

  /** Computed: inputs forwarded to the dynamically rendered Lucide icon component. */
  protected readonly iconInputs = computed(() => ({ size: this.sizePx() }));

  /** Computed: BEM class string for the host element. */
  protected readonly hostClasses = computed(() => ['ha-icon', `ha-icon--${this.size()}`].join(' '));
}
