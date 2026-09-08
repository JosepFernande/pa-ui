import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  contentChild,
  input,
} from '@angular/core';

/**
 * Showcase-local docs sidebar shell: brand block, a projected `<nav>` (the
 * app's own routerLink-based nav goes here, untouched), and an optional
 * footer/help slot that renders only when content is projected into it.
 *
 * Footer usage (not currently used by the showcase):
 * ```html
 * <app-sidebar brandTitle="halo-ui" brandSubtitle="...">
 *   <nav>...</nav>
 *   <div appSidebarFooter #appSidebarFooter>...</div>
 * </app-sidebar>
 * ```
 * The `#appSidebarFooter` local template reference (any name works for
 * projection itself — the `appSidebarFooter` attribute is what the
 * `<ng-content select>` below matches on) is what lets this component detect
 * whether anything was actually projected, so the divider + footer wrapper
 * only render when a consumer supplies one.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  /** Brand title shown next to the logo badge (e.g. "halo-ui"). */
  readonly brandTitle = input('halo-ui');

  /** Muted subtitle/tagline shown under the brand title. */
  readonly brandSubtitle = input('');

  /** Presence of the optional footer/help slot. */
  protected readonly footerContent = contentChild<ElementRef>('appSidebarFooter');
}
