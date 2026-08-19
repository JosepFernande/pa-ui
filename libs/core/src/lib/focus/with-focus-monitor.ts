import { DestroyRef, ElementRef, WritableSignal } from '@angular/core';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';

/**
 * Wires a host element to the Angular CDK FocusMonitor and surfaces the focus
 * origin as a writable signal. Cleanup is registered via DestroyRef, so callers
 * do not need to implement OnDestroy.
 *
 * @param elementRef — reference to the host element to monitor
 * @param focusMonitor — CDK FocusMonitor instance
 * @param destroyRef — DestroyRef used to stop monitoring on destroy
 * @param focusSignal — writable signal that receives each FocusOrigin value
 * @param options.checkChildren — forwarded to focusMonitor.monitor (default: true)
 * @param options.extras — callback executed after subscription and cleanup are wired
 */
export function withFocusMonitor(
  elementRef: ElementRef<HTMLElement>,
  focusMonitor: FocusMonitor,
  destroyRef: DestroyRef,
  focusSignal: WritableSignal<FocusOrigin | null>,
  options?: { checkChildren?: boolean; extras?: () => void },
): void {
  const checkChildren = options?.checkChildren ?? true;

  focusMonitor.monitor(elementRef.nativeElement, checkChildren).subscribe((origin) => {
    focusSignal.set(origin);
  });

  destroyRef.onDestroy(() => {
    focusMonitor.stopMonitoring(elementRef.nativeElement);
  });

  options?.extras?.();
}
