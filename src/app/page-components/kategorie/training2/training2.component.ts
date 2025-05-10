import { NgClass } from '@angular/common';
import { Component, ElementRef, Input, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

interface Word {
  value: string;
  type: number;
  data: {[key: string]: string | number};
}

interface Choice {
  value: string;
  choices: (string | number)[];
  class: string;
}

@Component({
  selector: 'app-training2',
  imports: [NgClass, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  templateUrl: './training2.component.html',
  styleUrl: './training2.component.scss'
})
export class Training2Component implements OnInit {
  @Input() mode: string = '';

  wordsArray = signal<Word[]>([]);

  typeOneChoices = signal<Choice[]>([
    {
      value: 'Pád',
      choices: ['-', 1,2,3,4,5,6,7],
      class: 'small'
    },
    {
      value: 'Číslo',
      choices: ['-', 'Jednotné', 'Množné'],
      class: 'medium'
    },
    {
      value: 'Rod',
      choices: ['-', 'Mužský', 'Ženský', 'Střední'],
      class: 'medium'
    },
    {
      value: 'Vzor',
      choices: ['-', ],
      class: 'medium'
    },
  ]);
  typeTwoChoices = signal<Choice[]>([
    {
      value: 'Osoba',
      choices: ['-', 1,2,3],
      class: 'small'
    },
    {
      value: 'Číslo',
      choices: ['-', 'Jednotné', 'Množné'],
      class: 'medium'
    },
    {
      value: 'Čas',
      choices: ['-', 'Přítomný', 'Minulý', 'Budoucí'],
      class: 'medium'
    },
    {
      value: 'Způsob',
      choices: ['-', 'Oznamovací', 'Rozkazovací', 'Tázací'],
      class: 'medium'
    },
    {
      value: 'Vid',
      choices: ['-', 'Dokonavý', 'Nedokonavý'],
      class: 'medium'
    },
    {
      value: 'Rod',
      choices: ['-', 'Činný', 'Nečinný'],
      class: 'medium'
    },
  ]);

  unformattedArray = {};
  veta = 'Kocour leze oknem, pes dírou.';

  ngOnInit(): void {
    if (this.mode !== 'custom') {
      this.requestSentence();

      this.wordsArray = signal<Word[]>([
        { value: "Ó", type: 3, data: {} },
        { value: "ne,", type: 3, data: {} },
        { value: "co", type: 1, data: {} },
        { value: "si", type: 3, data: {} },
        { value: "jen,", type: 1, data: {} },
        { value: "počneme.", type: 2, data: {} },
      ]);
    } 
  }

  requestSentence() {
    console.log('Větu pls tralalelo tralala')
  }

  async sendSentence(sentence: string): Promise<{[key: string]: {[key: string]: string | number}}> {
    try {
      const response = await fetch(`http://localhost:8000/morph/${encodeURIComponent(sentence)}`);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  formatSentence(sentence: {[key: string]: {[key: string]: string | number}}) {
    for (const [key, value] of Object.entries(sentence)) {
      const keys = Object.keys(value);
      if (keys.includes('Pád')) { // Podstatné jméno
        this.wordsArray.update((words) => [
          ...words,
          {
            value: key,
            type: 1,
            data: {
              Pád: value['Pád'],
              Číslo: value['Číslo'],
              Rod: value['Rod'],
              // Vzor: value['Vzor']
            }
          }
        ])
      }

      else if (Object.keys(value).length == 0) { // Nic
        this.wordsArray.update((words) => [
          ...words,
          { value: key, type: 3, data: {} }
        ])
      }

      else { // Sloveso
        this.wordsArray.update((words) => [
          ...words,
          {
            value: key,
            type: 2,
            data: {
              Osoba: value['Osoba'],
              Číslo: value['Číslo'],
              Čas: value['Čas'],
              Způsob: value['Způsob'],
              Vid: value['Vid'],
              Rod: value['Slovesný rod']
            }
          }
        ])
      }

      console.log(this.wordsArray());
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

  clickedWordType: number = 0;
  clickedWord: string = '';

  selectWord(word: Word) {
    if (word.type === 3) return;
    this.clickedWordType = word.type;
    this.clickedWord = word.value;
  }
}
