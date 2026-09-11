import { DestroyRef, ElementRef, WritableSignal, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';

import { withFocusMonitor } from './with-focus-monitor';

describe('withFocusMonitor', () => {
  let mockElement: HTMLElement;
  let elementRef: ElementRef<HTMLElement>;
  let focusOrigin$: Subject<FocusOrigin>;
  let focusMonitorMock: { monitor: jest.Mock; stopMonitoring: jest.Mock };
  let destroyRefMock: { onDestroy: jest.Mock };
  let focusSignal: WritableSignal<FocusOrigin | null>;
  let callOrder: string[];

  beforeEach(() => {
    mockElement = document.createElement('button');
    elementRef = new ElementRef(mockElement);
    focusOrigin$ = new Subject<FocusOrigin>();
    focusMonitorMock = {
      monitor: jest.fn().mockImplementation(() => {
        callOrder.push('monitor');
        return focusOrigin$.asObservable();
      }),
      stopMonitoring: jest.fn().mockImplementation(() => callOrder.push('stopMonitoring')),
    };
    destroyRefMock = {
      onDestroy: jest.fn().mockImplementation(() => callOrder.push('onDestroy')),
    };
    focusSignal = signal<FocusOrigin | null>(null);
    callOrder = [];
  });

  it('should call focusMonitor.monitor with the native element and checkChildren=true by default', () => {
    withFocusMonitor(
      elementRef,
      focusMonitorMock as unknown as FocusMonitor,
      destroyRefMock as unknown as DestroyRef,
      focusSignal,
    );

    expect(focusMonitorMock.monitor).toHaveBeenCalledTimes(1);
    expect(focusMonitorMock.monitor).toHaveBeenCalledWith(mockElement, true);
  });

  it('should pass checkChildren=false when options.checkChildren is false', () => {
    withFocusMonitor(
      elementRef,
      focusMonitorMock as unknown as FocusMonitor,
      destroyRefMock as unknown as DestroyRef,
      focusSignal,
      { checkChildren: false },
    );

    expect(focusMonitorMock.monitor).toHaveBeenCalledWith(mockElement, false);
  });

  it('should update the focus signal when FocusMonitor emits an origin', () => {
    withFocusMonitor(
      elementRef,
      focusMonitorMock as unknown as FocusMonitor,
      destroyRefMock as unknown as DestroyRef,
      focusSignal,
    );

    focusOrigin$.next('keyboard');
    expect(focusSignal()).toBe('keyboard');

    focusOrigin$.next('mouse');
    expect(focusSignal()).toBe('mouse');

    focusOrigin$.next(null);
    expect(focusSignal()).toBeNull();
  });

  it('should register stopMonitoring via DestroyRef.onDestroy', () => {
    withFocusMonitor(
      elementRef,
      focusMonitorMock as unknown as FocusMonitor,
      destroyRefMock as unknown as DestroyRef,
      focusSignal,
    );

    expect(destroyRefMock.onDestroy).toHaveBeenCalledTimes(1);

    const registeredCleanup = destroyRefMock.onDestroy.mock.calls[0][0] as () => void;
    registeredCleanup();

    expect(focusMonitorMock.stopMonitoring).toHaveBeenCalledTimes(1);
    expect(focusMonitorMock.stopMonitoring).toHaveBeenCalledWith(mockElement);
  });

  it('should execute options.extras after subscribing to FocusMonitor and registering cleanup', () => {
    const extras = jest.fn().mockImplementation(() => callOrder.push('extras'));

    withFocusMonitor(
      elementRef,
      focusMonitorMock as unknown as FocusMonitor,
      destroyRefMock as unknown as DestroyRef,
      focusSignal,
      { extras },
    );

    expect(extras).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['monitor', 'onDestroy', 'extras']);
  });
});
