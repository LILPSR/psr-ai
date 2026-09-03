import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges basic classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('handles undefined and null', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });

  it('handles objects and arrays', () => {
    expect(cn('class1', ['class2', 'class3'], { class4: true, class5: false })).toBe('class1 class2 class3 class4');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white p-4', 'bg-black')).toBe('p-4 bg-black');
  });

  it('handles complex conditional tailwind classes', () => {
    expect(cn(
      'px-2 py-1 bg-red-500',
      true && 'bg-blue-500',
      { 'px-4': true },
      ['text-sm', 'text-lg']
    )).toBe('py-1 bg-blue-500 px-4 text-lg');
  });
});
