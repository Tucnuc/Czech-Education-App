import { Component, effect, signal } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { ChoiceBtns2Component } from './choice-btns2/choice-btns2.component';
import { Training2Component } from './training2/training2.component';

export type eventArray = {
  mode: string;
  ready: boolean;
}

@Component({
  selector: 'app-kategorie',
  imports: [ChoiceBtns2Component, Training2Component],
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
