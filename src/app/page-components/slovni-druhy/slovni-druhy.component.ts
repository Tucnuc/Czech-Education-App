import { Component, signal } from '@angular/core';
import { ChoiceBtnsComponent } from './choice-btns/choice-btns.component';
import { TrainingComponent } from "./training/training.component";

export type eventArray = {
  mode: string;
  ready: boolean;
}

@Component({
  selector: 'app-slovni-druhy',
  imports: [ChoiceBtnsComponent, TrainingComponent],
  templateUrl: './slovni-druhy.component.html',
  styleUrl: './slovni-druhy.component.scss'
})
export class SlovniDruhyComponent {
  constructor() { }

  isReady = signal(false);
  mode = '';

  receiveEvent($event: eventArray) {
    this.mode = $event.mode
    this.isReady.set($event.ready);
  }
}