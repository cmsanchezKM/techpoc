import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { TagBadgeComponent, TagVariant } from './tag-badge';

describe('TagBadgeComponent', () => {
  it('should render the tag text and default variant classes', async () => {
    await render(TagBadgeComponent, {
      componentInputs: {
        tag: 'Category',
      },
    });

    const badge = screen.getByRole('status');
    expect(badge.textContent?.trim()).toBe('Category');
    expect(badge.className).toContain('bg-brand-tag text-brand-secondary');
  });

  it('should apply the correct CSS classes for a specific variant', async () => {
    const variant: TagVariant = 'success';

    await render(TagBadgeComponent, {
      componentInputs: {
        tag: 'Active',
        variant,
      },
    });

    const badge = screen.getByRole('status');
    expect(badge.className).toContain('bg-green-100 text-green-700');
  });
});
