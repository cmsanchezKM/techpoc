import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { CardComponent } from './card';

describe('CardComponent', () => {
  const mockProps = {
    title: 'Full Stack Development',
    description: 'An in-depth article about modern frontend architecture.',
    date: '2026-01-10T00:00:00.000Z',
    author: 'Ada Lovelace',
    tags: ['Architecture', 'TypeScript'],
    styles: 'bg-white text-black',
  };

  it('should render all child components and pass input data correctly', async () => {
    await render(CardComponent, {
      componentInputs: mockProps,
    });

    // Title
    expect(screen.getByRole('heading', { level: 2, name: mockProps.title })).toBeTruthy();

    // Description
    expect(screen.getByText(mockProps.description)).toBeTruthy();

    // Date
    expect(screen.getByText(/Jan 2026/i)).toBeTruthy();

    // Author & computed initials
    expect(screen.getByText(mockProps.author)).toBeTruthy();
    expect(screen.getByText('AL')).toBeTruthy();

    // Tags
    expect(screen.getByText('Architecture')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
  });
});
