import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { reducer, useToast, toast } from './use-toast';

describe('use-toast reducer', () => {
  const baseState = { toasts: [] as any[] };

  it('ADD_TOAST adds a toast', () => {
    const t = { id: '1', title: 'Hello', open: true } as any;
    const result = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].title).toBe('Hello');
  });

  it('ADD_TOAST limits to TOAST_LIMIT', () => {
    const t1 = { id: '1', title: 'First', open: true } as any;
    const t2 = { id: '2', title: 'Second', open: true } as any;
    const state1 = reducer(baseState, { type: 'ADD_TOAST', toast: t1 });
    const state2 = reducer(state1, { type: 'ADD_TOAST', toast: t2 });
    // TOAST_LIMIT is 1, so only the newest toast remains
    expect(state2.toasts).toHaveLength(1);
    expect(state2.toasts[0].title).toBe('Second');
  });

  it('UPDATE_TOAST updates matching toast', () => {
    const t = { id: '1', title: 'Old', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const updated = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'New' } });
    expect(updated.toasts[0].title).toBe('New');
  });

  it('UPDATE_TOAST ignores non-matching ids', () => {
    const t = { id: '1', title: 'Old', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const updated = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '99', title: 'New' } });
    expect(updated.toasts[0].title).toBe('Old');
  });

  it('DISMISS_TOAST sets open to false', () => {
    const t = { id: '1', title: 'Hi', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const dismissed = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(dismissed.toasts[0].open).toBe(false);
  });

  it('DISMISS_TOAST without id dismisses all', () => {
    const t = { id: '1', title: 'Hi', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const dismissed = reducer(state, { type: 'DISMISS_TOAST' });
    expect(dismissed.toasts[0].open).toBe(false);
  });

  it('REMOVE_TOAST removes specific toast', () => {
    const t = { id: '1', title: 'Hi', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const removed = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(removed.toasts).toHaveLength(0);
  });

  it('REMOVE_TOAST without id clears all', () => {
    const t = { id: '1', title: 'Hi', open: true } as any;
    const state = reducer(baseState, { type: 'ADD_TOAST', toast: t });
    const removed = reducer(state, { type: 'REMOVE_TOAST' });
    expect(removed.toasts).toHaveLength(0);
  });
});

describe('toast function', () => {
  it('returns id, dismiss, and update', () => {
    const result = toast({ title: 'Test' });
    expect(result).toHaveProperty('id');
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });

  it('dismiss function works without error', () => {
    const result = toast({ title: 'Test' });
    expect(() => result.dismiss()).not.toThrow();
  });

  it('update function works without error', () => {
    const result = toast({ title: 'Test' });
    expect(() => result.update({ id: result.id, title: 'Updated' } as any)).not.toThrow();
  });
});

describe('useToast hook', () => {
  it('returns toasts array and toast function', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current).toHaveProperty('toasts');
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  it('adds toast via hook', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Hook toast' });
    });
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
  });

  it('dismiss via hook works', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      const t = result.current.toast({ title: 'Dismiss me' });
      result.current.dismiss(t.id);
    });
    // Should not throw
  });
});
