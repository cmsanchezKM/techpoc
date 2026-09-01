import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import { PaginationComponent } from './pagination';

class TranslocoLoaderMock implements TranslocoLoader {
  getTranslation() {
    return of({
      pagination: {
        previous: 'Previous',
        next: 'Next',
        pageNavigation: 'Page navigation',
        pageNumbers: 'Page numbers',
        goToPage: 'Go to page',
        previousPageLabel: 'Go to previous page',
        nextPageLabel: 'Go to next page',
      },
    });
  }
}

function renderPagination(componentInputs: Record<string, unknown>) {
  return render(PaginationComponent, {
    componentInputs,
    providers: [
      provideTransloco({
        config: { availableLangs: ['es', 'en'], defaultLang: 'es' },
        loader: TranslocoLoaderMock,
      }),
    ],
  });
}

describe('PaginationComponent', () => {
  it('lists every page without ellipsis when total <= maxVisible', async () => {
    const { fixture } = await renderPagination({ page: 1, total: 3, maxVisible: 5 });

    expect(fixture.componentInstance.visiblePages()).toEqual([1, 2, 3]);
  });

  it('shows a trailing ellipsis when the current page is near the start', async () => {
    const { fixture } = await renderPagination({ page: 1, total: 10, maxVisible: 3 });

    expect(fixture.componentInstance.visiblePages()).toEqual([1, 2, 3, 'ellipsis', 10]);
  });

  it('shows a leading ellipsis when the current page is near the end', async () => {
    const { fixture } = await renderPagination({ page: 10, total: 10, maxVisible: 3 });

    expect(fixture.componentInstance.visiblePages()).toEqual([1, 'ellipsis', 8, 9, 10]);
  });

  it('shows both ellipses when the current page is in the middle', async () => {
    const { fixture } = await renderPagination({ page: 5, total: 10, maxVisible: 3 });

    expect(fixture.componentInstance.visiblePages()).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      'ellipsis',
      10,
    ]);
  });

  it('disables Previous on the first page and Next on the last page', async () => {
    await renderPagination({ page: 1, total: 3 });

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('emits pageChange when clicking a page number', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderPagination({ page: 1, total: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(emitted).toEqual([2]);
  });

  it('does not emit when clicking the current page', async () => {
    const { fixture } = await renderPagination({ page: 2, total: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    fixture.componentInstance.onPageClick(2);

    expect(emitted).toEqual([]);
  });

  it('emits the previous page and does not go below 1', async () => {
    const { fixture } = await renderPagination({ page: 2, total: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    fixture.componentInstance.onPreviousClick();
    expect(emitted).toEqual([1]);

    fixture.componentRef.setInput('page', 1);
    fixture.componentInstance.onPreviousClick();
    expect(emitted).toEqual([1]);
  });

  it('emits the next page and does not go above total', async () => {
    const { fixture } = await renderPagination({ page: 2, total: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    fixture.componentInstance.onNextClick();
    expect(emitted).toEqual([3]);

    fixture.componentRef.setInput('page', 3);
    fixture.componentInstance.onNextClick();
    expect(emitted).toEqual([3]);
  });
});
