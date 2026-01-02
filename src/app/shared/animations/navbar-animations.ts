import { trigger, state, style, transition, animate } from '@angular/animations';

export const navbarAnimation = trigger('navbarAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-10px)' }),
    animate(
      '250ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ])
]);

export const mobileMenuAnimation = trigger('mobileMenuAnimation', [
  state(
    'closed',
    style({
      height: '0',
      opacity: 0,
      overflow: 'hidden'
    })
  ),
  state(
    'open',
    style({
      height: '*',
      opacity: 1
    })
  ),
  transition('closed <=> open', animate('200ms ease-in-out'))
]);
