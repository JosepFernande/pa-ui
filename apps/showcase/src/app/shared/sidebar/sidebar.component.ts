import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Showcase-local docs sidebar shell: brand block, the docs nav, and the
 * help/footer card — all hardcoded directly in this component's own
 * template (no content projection).
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
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
}
