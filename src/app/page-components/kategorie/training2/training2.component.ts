import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';

interface Word {
  value: string;
  type: number;
}

@Component({
  selector: 'app-training2',
  imports: [NgClass],
  templateUrl: './training2.component.html',
  styleUrl: './training2.component.scss'
})
export class Training2Component {
  wordsArray = signal<Word[]>([
    { value: "Kočka", type: 1 },
    { value: "leze", type: 2 },
    { value: "dírou,", type: 1 },
    { value: "pes", type: 3 },
    { value: "oknem,", type: 1 },
    { value: "pes", type: 1 },
    { value: "oknem.", type: 2 },
  ])
}
