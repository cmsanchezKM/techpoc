import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent, IconName } from '../icons';

export type ErrorPageCode = 403 | 404 | 500;

interface ErrorPageContent {
  icon: IconName;
  key: 'forbidden' | 'notFound' | 'serverError';
}

const ERROR_CONTENT: Record<ErrorPageCode, ErrorPageContent> = {
  403: { icon: 'lock', key: 'forbidden' },
  404: { icon: 'alert-circle', key: 'notFound' },
  500: { icon: 'alert-circle', key: 'serverError' },
};

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, IconComponent, TranslocoPipe],
  templateUrl: './error-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ErrorPage {
  code = input<ErrorPageCode>(404);

  protected readonly content = computed(() => ERROR_CONTENT[this.code()]);
}
