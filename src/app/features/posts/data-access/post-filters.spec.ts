import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostFilters } from './post-filters';

describe('PostFilters', () => {
  let queryParams$: BehaviorSubject<Params>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  function setup(initialParams: Params = {}) {
    queryParams$ = new BehaviorSubject<Params>(initialParams);
    navigateSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        PostFilters,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$,
            queryParamMap: queryParams$.pipe(map((params) => convertToParamMap(params))),
          },
        },
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });

    return TestBed.inject(PostFilters);
  }

  it('se inicializa a partir de los query params existentes', () => {
    const service = setup({ search: 'angular', tag: 'signals', author: '2' });

    expect(service.searchTerm()).toBe('angular');
    expect(service.selectedTag()).toBe('signals');
    expect(service.selectedAuthor()).toBe('2');
  });

  it('usa valores por defecto cuando no hay query params', () => {
    const service = setup();

    expect(service.searchTerm()).toBe('');
    expect(service.selectedTag()).toBeNull();
    expect(service.selectedAuthor()).toBeNull();
  });

  it('actualiza los signals cuando cambian los query params de la ruta', () => {
    const service = setup();

    queryParams$.next({ search: 'foo', tag: 'bar', author: '9' });

    expect(service.searchTerm()).toBe('foo');
    expect(service.selectedTag()).toBe('bar');
    expect(service.selectedAuthor()).toBe('9');
  });

  it('setSearchTerm navega fusionando query params y reemplazando la URL', () => {
    const service = setup();

    service.setSearchTerm('angular');

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { search: 'angular' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });

  it('setSearchTerm limpia el query param cuando el término está vacío', () => {
    const service = setup();

    service.setSearchTerm('');

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { search: null } }),
    );
  });

  it('setSelectedTag navega con el tag elegido', () => {
    const service = setup();

    service.setSelectedTag('angular');

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { tag: 'angular' } }),
    );
  });

  it('setSelectedAuthor navega con el autor elegido', () => {
    const service = setup();

    service.setSelectedAuthor('3');

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { author: '3' } }),
    );
  });

  it('reset limpia todos los filtros', () => {
    const service = setup({ search: 'angular', tag: 'signals', author: '2' });

    service.reset();

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { search: null, tag: null, author: null },
      }),
    );
  });
});
