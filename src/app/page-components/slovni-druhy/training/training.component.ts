import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Output, signal, ViewChild, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

interface Word {
  value: string;
  type: number;
  color?: string;
  chosenType?: number;
  shortcut?: string;
}

interface Druh {
  value: number;
  viewValue: string;
  color: string;
  selected: boolean;
  shortcut: string;
}

@Component({
  selector: 'app-training',
  imports: [NgClass, NgStyle, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  @Input() mode: string = '';
  @Output() returningEvent = new EventEmitter;

  veta: string = 'Kočka leze dírou, pes oknem.';
  unformattedArray = {};

  wordsArray = signal<Word[]>([]);
  
  druhy = signal<Druh[]>([
    { value: 1, viewValue: 'Podstatné jméno', color: '#D52127', selected: false, shortcut: 'Pods.' },
    { value: 2, viewValue: 'Přídavné jméno', color: '#F36621', selected: false, shortcut: 'Příd.' },
    { value: 3, viewValue: 'Zájméno', color: '#FCED23', selected: false, shortcut: 'Zájm.' },
    { value: 4, viewValue: 'Číslovka', color: '#8CC640', selected: false, shortcut: 'Čísl.' },
    { value: 5, viewValue: 'Sloveso', color: '#07B151', selected: false, shortcut: 'Slov.' },
    { value: 6, viewValue: 'Příslovce', color: '#2FBBB3', selected: false, shortcut: 'Přís.' },
    { value: 7, viewValue: 'Předložka', color: '#2357BC', selected: false, shortcut: 'Před.' },
    { value: 8, viewValue: 'Spojka', color: '#4C489B', selected: false, shortcut: 'Spoj.' },
    { value: 9, viewValue: 'Částice', color: '#733B97', selected: false, shortcut: 'Část.' },
    { value: 10, viewValue: 'Citoslovce', color: '#AF3A94', selected: false, shortcut: 'Cit.' },
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
        words.map((word, i) => {
          if (i === index && word.type !== 0) {
            return { 
              ...word, 
              color: vybranyDruh.color, 
              chosenType: vybranyDruh.value, 
              shortcut: vybranyDruh.shortcut 
            };
          }
          return word;
        })
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
    console.log(this.mode)
    if (this.mode !== 'custom') {
      this.requestSentence();
    }
  }

  alreadyRequesting: boolean = false;
  async requestSentence(retryCount: number = 0, maxRetries: number = 3) {
    if (retryCount === 0) this.alreadyRequesting = true;

    this.wordsArray.set([{ value: 'Generování..', type: 0 }]);

    try {
      const response = await fetch(`http://localhost:8000/generate/${this.mode}`);
      const data = await response.json();
      
      this.formatSentence(data.pos);
    } catch (err) {
      console.error(`Attempt ${retryCount + 1} failed:`, err);

      if (retryCount < maxRetries) {
        const retryDelay = 1000 * (retryCount + 1);

        this.wordsArray.set([{ value: `Opakuji, pokus ${retryCount + 1}...`, type: 0 }]);

        setTimeout(() => {
          this.requestSentence(retryCount + 1, maxRetries);
        }, retryDelay);
      } else {
        this.wordsArray.set([{ value: 'Chyba připojení k serveru', type: 0 }]);
      }
    }
  }

  async sendSentence(sentence: string): Promise<{ [key: string]: number }> {
    this.wordsArray.set([{ value: 'Načítání..', type: 0 }]);
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
    this.wordsArray.set([]);
    for (const [key, value] of Object.entries(sentence)) {
      this.wordsArray.update((words) => [
        ...words,
        { value: key, type: value }
      ])
    }
    this.alreadyRequesting = false;
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

  getShortcutForType(type: number): string {
    const druh = this.druhy().find(druh => druh.value === type);
    return druh?.shortcut || '';
  }

  answersSubmitted: boolean = false;
  submitAnswers() {
    if (this.answersSubmitted) {
      this.answersSubmitted = false;
      this.wordsArray.update((words) =>
        words.map((word) => ({ ...word, color: undefined, chosenType: undefined, shortcut: undefined }))
      );

      if (this.mode) {
        this.requestSentence();
      } else {
        this.returnBack();
      }

    } else {
      this.answersSubmitted = true;
      this.wordsArray.update((words) =>
        words.map((word) =>
          word.type === word.chosenType
            ? { ...word, color: 'green' }
            : { ...word, color: 'red' }
        )
      );
      this.druhy.update((druhy) =>
        druhy.map((druh) => ({ ...druh, selected: false }))
      );
    }
  }

  returnBack() {
    this.returningEvent.emit();
  }
}
