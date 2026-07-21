import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { CardHeaderComponent } from './card-header';

describe('CardHeaderComponent', () => {
  it('should render the title correctly without a date', async () => {
    await render(CardHeaderComponent, {
      componentInputs: {
        title: 'Header Title',
      },
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Header Title' })).toBeTruthy();
    expect(screen.queryByText(/202/)).toBeNull();
  });

  it('should render the formatted date when date input is provided', async () => {
    await render(CardHeaderComponent, {
      componentInputs: {
        title: 'Header Title',
        date: '2026-03-15T00:00:00.000Z',
      },
    });

    // Validates that DatePipe formats the date string into 'MMM yyyy'
    const timeElement = screen.getByText(/Mar 2026/i);
    expect(timeElement).toBeTruthy();
  });
});
