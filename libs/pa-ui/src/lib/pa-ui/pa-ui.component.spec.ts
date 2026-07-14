import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewEncapsulation, ChangeDetectionStrategy, ɵReflectionCapabilities } from '@angular/core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { PaUiComponent } from './pa-ui.component';

describe('PaUiComponent', () => {
  let component: PaUiComponent;
  let fixture: ComponentFixture<PaUiComponent>;

  const reflection = new ɵReflectionCapabilities();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('architectural compliance', () => {
    function getComponentAnnotation(): Record<string, unknown> | undefined {
      const annotations = reflection.annotations(PaUiComponent);
      return annotations.find(
        (a: Record<string, unknown>) => a['selector'] !== undefined,
      );
    }

    it('should be standalone', () => {
      const annotation = getComponentAnnotation();
      expect(annotation).toBeDefined();
      expect(annotation!['standalone']).toBe(true);
    });

    it('should use ViewEncapsulation.None', () => {
      const annotation = getComponentAnnotation();
      expect(annotation).toBeDefined();
      expect(annotation!['encapsulation']).toBe(ViewEncapsulation.None);
    });

    it('should use ChangeDetectionStrategy.OnPush', () => {
      const annotation = getComponentAnnotation();
      expect(annotation).toBeDefined();
      expect(annotation!['changeDetection']).toBe(
        ChangeDetectionStrategy.OnPush,
      );
    });

    it('should use .css styleUrl, not .scss', () => {
      // The component compiled successfully in TestBed — the styleUrl is valid.
      // Verify the .css file exists on disk and the .scss was renamed.
      const cssPath = join(__dirname, 'pa-ui.component.css');
      const scssPath = join(__dirname, 'pa-ui.component.scss');
      expect(existsSync(cssPath)).toBe(true);
      expect(existsSync(scssPath)).toBe(false);
      // Also verify the component can be rendered (proves styleUrl resolves)
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });
  });
});
