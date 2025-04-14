import { NgClass, NgStyle } from '@angular/common';
import { Component, signal } from '@angular/core';

interface Word {
  value: string;
  type: number;
  color?: string;
}

interface Druh {
  value: number;
  viewValue: string;
  count: number;
  color: string;
  selected: boolean;
}

@Component({
  selector: 'app-easy',
  imports: [NgClass, NgStyle],
  templateUrl: './easy.component.html',
  styleUrl: './easy.component.scss'
})
export class EasyComponent {
  wordsArray = signal<Word[]>([
    { value: "Kočka", type: 1 },
    { value: "leze", type: 2 },
    { value: "dírou,", type: 1 },
    { value: "pes", type: 3 },
    { value: "oknem,", type: 1 },
    { value: "pes", type: 1 },
    { value: "oknem.", type: 2 },
  ])
  
  druhy = signal<Druh[]>([
    { value: 1, viewValue: 'Podstatné jméno', count: 4, color: 'red', selected: false },
    { value: 2, viewValue: 'Přídavné jméno', count: 2, color: 'orange', selected: false },
    { value: 3, viewValue: 'Zájméno', count: 1, color: 'rgb(255, 225, 0)', selected: false },
  ])

  druhVybrani(index: number) {
    this.druhy.update((druhy) =>
      druhy.map((druh, i) => ({ ...druh, selected: i === index }))
    );
  }

  obarvitSlovo(index: number) {
    const vybranyDruh = this.druhy().find((druh) => druh.selected);
    if (vybranyDruh) {
      this.wordsArray.update((words) =>
        words.map((word, i) =>
          i === index ? { ...word, color: vybranyDruh.color } : word
        )
      );
    }
  }

  cursorPosition = signal<{ top: string; left: string }>({ top: '0px', left: '0px' });
  onMouseMove(event: MouseEvent) {
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      const cursorSize = 25;
      const offset = 10;
  
      const maxX = rect.width - cursorSize;
      const maxY = rect.height - cursorSize;
  
      const cursorX = Math.min(Math.max(event.clientX - rect.left - offset, 0), maxX);
      const cursorY = Math.min(Math.max(event.clientY - rect.top - offset, 0), maxY);
  
      this.cursorPosition.set({
        top: `${cursorY}px`,
        left: `${cursorX}px`
      });
    }
  }

  get cursorColor(): string {
    const vybranyDruh = this.druhy().find((druh) => druh.selected);
    return vybranyDruh ? vybranyDruh.color : 'transparent';
  }
}
