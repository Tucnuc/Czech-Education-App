import { Component, effect, signal } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { Easy2Component } from './easy2/easy2.component';
import { Normal2Component } from './normal2/normal2.component';
import { Hard2Component } from './hard2/hard2.component';
import { Custom2Component } from './custom2/custom2.component';
import { ChoiceBtns2Component } from './choice-btns2/choice-btns2.component';

export type eventArray = {
  mode: string;
  ready: boolean;
}

@Component({
  selector: 'app-kategorie',
  imports: [
    ChoiceBtns2Component,
    Easy2Component, Normal2Component, Hard2Component, Custom2Component
  ],
  templateUrl: './kategorie.component.html',
  styleUrl: './kategorie.component.scss'
})
export class KategorieComponent {
  constructor(public shared:SharedService) { }

  isReady = signal(false);
  mode = '';

  receiveEvent($event: eventArray) {
    this.mode = $event.mode
    this.isReady.set($event.ready);
  }
}
