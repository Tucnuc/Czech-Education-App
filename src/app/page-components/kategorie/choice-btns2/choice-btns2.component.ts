import { NgClass } from '@angular/common';
import { Component, signal, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type choiceBtn = {
  name: string;
  id: string;
  selected: boolean;
}

export type eventArray = {
  mode: string;
  ready: boolean;
}

@Component({
  selector: 'app-choice-btns2',
  imports: [MatButtonModule, MatIconModule, NgClass],
  templateUrl: './choice-btns2.component.html',
  styleUrl: './choice-btns2.component.scss'
})
export class ChoiceBtns2Component {
  @Output() event = new EventEmitter<eventArray>()
    
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
            this.event.emit({ mode: diffBtn.id, ready: true });
          }
          break;

        case 'custom':
          this.event.emit({ mode: modeBtn.id, ready: true });
          break;
      }
    }
  }
}
