import { Component } from '@angular/core';
import { ChoiceBtnsComponent } from '../choice-btns/choice-btns.component';

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
  
}
