import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) {
      return '';
    }

    const elapsedMinutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000);

    if (elapsedMinutes < 1) {
      return 'just now';
    }
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.round(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.round(elapsedHours / 24);
    return `${elapsedDays}d ago`;
  }
}
