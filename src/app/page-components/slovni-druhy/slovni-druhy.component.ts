import { Component } from '@angular/core';
import { ChoiceBtnsComponent } from '../choice-btns/choice-btns.component';
import { SharedService } from '../../shared/shared.service';

export type choiceBtn = {
  name: string;
  id: string;
  selected: boolean;
}

@Component({
  selector: 'app-slovni-druhy',
  imports: [ChoiceBtnsComponent],
  templateUrl: './slovni-druhy.component.html',
  styleUrl: './slovni-druhy.component.scss'
})
export class SlovniDruhyComponent {
  constructor(public shared:SharedService) { }

  get isReady(): boolean {
    const slovniDruhy = this.shared.database().find(item => item.id === 'slovniDruhy');
    return slovniDruhy?.ready || false;
  }

  presetVeta = 'Kočka leze dírou, pes oknem.';
}
