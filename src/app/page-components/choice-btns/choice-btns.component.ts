import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

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
}
