import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedService } from '../../shared/shared.service';

export type choiceBtn = {
  name: string;
  id: string;
  selected: boolean;
}

@Component({
  selector: 'app-choice-btns',
  imports: [MatInputModule, MatButtonModule, MatIconModule, NgClass],
  templateUrl: './choice-btns.component.html',
  styleUrl: './choice-btns.component.scss'
})
export class ChoiceBtnsComponent {
  constructor(private shared:SharedService) { }

  currentPage: string = 'slovniDruhy';

  modeBtns = signal<choiceBtn[]>([
    { name: 'Procvičování', id: 'preset', selected: false },
    { name: 'Vlastní zadání', id: 'custom', selected: false },
  ])
  diffBtns = signal<choiceBtn[]>([
    { name: 'Jednoduchá', id: 'easy', selected: false },
    { name: 'Střední', id: 'normal', selected: false },
    { name: 'Těžká', id: 'hard', selected: false },
  ])

  selectMode(index: number) {
    this.modeBtns.update((btns) =>
      btns.map((btn, i) => ({ ...btn, selected: i === index }))
    );

    if (this.modeBtns()[1].selected) {
      this.diffBtns.update((btns) =>
        btns.map((btn) => ({ ...btn, selected: false }))
      );
    }
  }
  selectDifficulty(index: number) {
    if (this.modeBtns()[0].selected) {
      this.diffBtns.update((btns) =>
        btns.map((btn, i) => ({ ...btn, selected: i === index }))
      );
    }
  }

  choosingFinished() {
    const modeBtn: choiceBtn | undefined = this.modeBtns().find((btn) => btn.selected);
    const diffBtn: choiceBtn | undefined = this.diffBtns().find((btn) => btn.selected);
    if (modeBtn) {
      switch(modeBtn.id) {
        case 'preset':
          if (diffBtn) {
            this.shared.setData(this.currentPage, 'mode', diffBtn.id);
            this.shared.setData(this.currentPage, 'ready', true);
          }
          break;

        case 'custom':
          this.shared.setData(this.currentPage, 'mode', modeBtn.id);
          this.shared.setData(this.currentPage, 'ready', true);
          break;
      }
    }
  }
}
