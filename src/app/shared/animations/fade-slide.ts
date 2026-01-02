import { trigger, transition, style, animate } from '@angular/animations';

export const fadeSlide = trigger('fadeSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('200ms ease-out')
  ])
]);

export const expandCollapse = trigger('expandCollapse', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-8px)' }),
    animate(
      '200ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate(
      '150ms ease-in',
      style({ opacity: 0, transform: 'translateY(-8px)' })
    )
  ])
])