import { Component, effect, signal } from '@angular/core';
import { ChoiceBtnsComponent } from '../choice-btns/choice-btns.component';
import { SharedService } from '../../shared/shared.service';
import { EasyComponent } from './easy/easy.component';
import { NormalComponent } from './normal/normal.component';
import { HardComponent } from './hard/hard.component';
import { CustomComponent } from './custom/custom.component';

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
  isReady = signal(false);
  mode = '';

  constructor(public shared:SharedService) {
    effect(() => {
      const slovniDruhy = this.shared.database().find(item => item.id === 'slovniDruhy');
      this.isReady.set(slovniDruhy?.ready || false);

      if (this.isReady()) {
        this.mode = (shared.getData('slovniDruhy', 'mode') as string | undefined) ?? '';
      }
    });
  }

}
