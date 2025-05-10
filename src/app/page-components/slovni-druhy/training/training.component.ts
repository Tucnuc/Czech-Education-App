import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, Input, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface Word {
  value: string;
  type: number;
  color?: string;
}

interface Druh {
  value: number;
  viewValue: string;
  color: string;
  selected: boolean;
}

@Component({
  selector: 'app-training',
  imports: [NgClass, NgStyle, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  @Input() mode: string = '';

  veta: string = 'Kočka leze dírou, pes oknem.';
  unformattedArray = {};

  wordsArray = signal<Word[]>([]);
  
  druhy = signal<Druh[]>([
    { value: 1, viewValue: 'Podstatné jméno', color: '#D52127', selected: false },
    { value: 2, viewValue: 'Přídavné jméno', color: '#F36621', selected: false },
    { value: 3, viewValue: 'Zájméno', color: '#FCED23', selected: false },
    { value: 4, viewValue: 'Číslovka', color: '#8CC640', selected: false },
    { value: 5, viewValue: 'Sloveso', color: '#07B151', selected: false },
    { value: 6, viewValue: 'Příslovce', color: '#2FBBB3', selected: false },
    { value: 7, viewValue: 'Předložka', color: '#2357BC', selected: false },
    { value: 8, viewValue: 'Spojka', color: '#4C489B', selected: false },
    { value: 9, viewValue: 'Částice', color: '#733B97', selected: false },
    { value: 10, viewValue: 'Citoslovce', color: '#AF3A94', selected: false },
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

  ngOnInit(): void {
    if (this.mode !== 'custom') {
      this.requestSentence();

      this.wordsArray = signal<Word[]>([
        { value: "Kočka", type: 1 },
        { value: "leze", type: 2 },
        { value: "dírou,", type: 1 },
        { value: "pes", type: 3 },
        { value: "oknem,", type: 1 },
        { value: "pes", type: 1 },
        { value: "oknem.", type: 2 },
      ]);
    }
  }

  requestSentence() {
    console.log('Větu pls tralalelo tralala')
  }

  async sendSentence(sentence: string): Promise<{ [key: string]: number }> {
    try {
      const response = await fetch(`http://localhost:8000/pos/${encodeURIComponent(sentence)}`);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  formatSentence(sentence: {[key: string]: number}) {
    for (const [key, value] of Object.entries(sentence)) {
      this.wordsArray.update((words) => [
        ...words,
        { value: key, type: value }
      ])
    }
  }

  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  async onSubmit() {
    const inputValue: string = this.inputElement.nativeElement.value.trim();
    if (inputValue) {
      this.mode = '';
      const sentenceData = await this.sendSentence(inputValue);
      this.formatSentence(sentenceData);
      console.log('Zadaná věta:', inputValue);
    } else {
      console.warn('Vstup je prázdný!');
    }
  }
}
