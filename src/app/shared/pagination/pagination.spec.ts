import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  it('should render all page buttons when totalPages is less than maxVisiblePages', async () => {
    await render(PaginationComponent, {
      componentInputs: {
        page: 1,
        total: 3,
        maxVisible: 5,
      },
    });

    // Check page numbers
    expect(screen.getByRole('button', { name: 'Ir a página 1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ir a página 2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ir a página 3' })).toBeTruthy();

    // Check that ellipsis is not present
    expect(screen.queryByText('...')).toBeNull();
  });

  it('should render ellipsis when totalPages exceeds maxVisiblePages', async () => {
    await render(PaginationComponent, {
      componentInputs: {
        page: 5,
        total: 10,
        maxVisible: 5,
      },
    });

    // Check first and last page buttons exist
    expect(screen.getByRole('button', { name: 'Ir a página 1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ir a página 10' })).toBeTruthy();

    // Check ellipsis rendered
    expect(screen.getByText('...')).toBeTruthy();
  });

  it('should disable "Previous" button on the first page', async () => {
    await render(PaginationComponent, {
      componentInputs: {
        page: 1,
        total: 5,
      },
    });

    const previousButton = screen.getByRole('button', {
      name: 'Ir a página anterior',
    }) as HTMLButtonElement;
    expect(previousButton.disabled).toBe(true);
  });

  it('should disable "Next" button on the last page', async () => {
    await render(PaginationComponent, {
      componentInputs: {
        page: 5,
        total: 5,
      },
    });

    const nextButton = screen.getByRole('button', {
      name: 'Ir a página siguiente',
    }) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  it('should emit pageChange event when clicking on a page number', async () => {
    const pageChangeSpy = vi.fn();

    await render(PaginationComponent, {
      componentInputs: {
        page: 1,
        total: 5,
      },
      componentOutputs: {
        pageChange: { emit: pageChangeSpy } as any,
      },
    });

    const user = userEvent.setup();
    const pageTwoButton = screen.getByRole('button', { name: 'Ir a página 2' });

    await user.click(pageTwoButton);

    expect(pageChangeSpy).toHaveBeenCalledWith(2);
  });

  it('should emit pageChange event when clicking "Next" and "Previous" buttons', async () => {
    const pageChangeSpy = vi.fn();

    await render(PaginationComponent, {
      componentInputs: {
        page: 2,
        total: 5,
      },
      componentOutputs: {
        pageChange: { emit: pageChangeSpy } as unknown,
      },
    });

    const user = userEvent.setup();

    // Click Next
    const nextButton = screen.getByRole('button', { name: 'Ir a página siguiente' });
    await user.click(nextButton);
    expect(pageChangeSpy).toHaveBeenLastCalledWith(3);

    // Click Previous
    const previousButton = screen.getByRole('button', { name: 'Ir a página anterior' });
    await user.click(previousButton);
    expect(pageChangeSpy).toHaveBeenLastCalledWith(1);
  });

  it('should not emit pageChange when clicking the current page button', async () => {
    const pageChangeSpy = vi.fn();

    await render(PaginationComponent, {
      componentInputs: {
        page: 2,
        total: 5,
      },
      componentOutputs: {
        pageChange: { emit: pageChangeSpy } as unknown,
      },
    });

    const user = userEvent.setup();
    const currentPageButton = screen.getByRole('button', { name: 'Ir a página 2' });

    await user.click(currentPageButton);

    expect(pageChangeSpy).not.toHaveBeenCalled();
  });
});
