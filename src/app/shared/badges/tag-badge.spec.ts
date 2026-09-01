import { render, screen } from '@testing-library/angular';
import { TagBadgeComponent } from './tag-badge';

describe('TagBadgeComponent', () => {
  it('renders the tag text', async () => {
    await render(TagBadgeComponent, {
      componentInputs: { tag: 'angular' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('angular');
  });

  it.each([
    ['default', 'bg-brand-tag'],
    ['accent', 'bg-blue-100'],
    ['success', 'bg-green-100'],
    ['warning', 'bg-yellow-100'],
    ['error', 'bg-red-100'],
  ] as const)('applies the "%s" variant classes', async (variant, expectedClass) => {
    await render(TagBadgeComponent, {
      componentInputs: { tag: 'angular', variant },
    });

    expect(screen.getByRole('status').className).toContain(expectedClass);
  });
});
