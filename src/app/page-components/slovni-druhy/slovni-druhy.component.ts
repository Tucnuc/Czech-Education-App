import { Component, effect, signal } from '@angular/core';
import { EasyComponent } from './easy/easy.component';
import { NormalComponent } from './normal/normal.component';
import { HardComponent } from './hard/hard.component';
import { CustomComponent } from './custom/custom.component';
import { ChoiceBtnsComponent } from './choice-btns/choice-btns.component';

export type eventArray = {
  mode: string;
  ready: boolean;
}

@Component({
  selector: 'app-slovni-druhy',
  imports: [
    ChoiceBtnsComponent,
    EasyComponent, NormalComponent, HardComponent, CustomComponent
  ],
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
