import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
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
  selectedChoices?: { [key: string]: string | number };
  correctChoices?: { [key: string]: boolean };
  score?: number;
}

interface Choice {
  value: string;
  predeterment?: string[];
  choices: (string | number)[];
  class: string;
}

interface Choice2 {
  word: string;
  data: { [key: string]: string | number };
}

@Component({
  selector: 'app-training2',
  imports: [NgClass, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  templateUrl: './training2.component.html',
  styleUrl: './training2.component.scss'
})
export class Training2Component implements OnInit {
  @Input() mode: string = '';
  @Output() returningEvent = new EventEmitter;

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
      predeterment: ['Rod'],
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
    } 
  }

  async requestSentence() {
    this.wordsArray.set([{ value: 'Generování..', type: 0, data: {} }]);

    try {
      const response = await fetch(`http://localhost:8000/generate`);
      const data = await response.json();
      console.log(data)
      this.formatSentence(data.morph);
    } catch (err) { console.error(err) }
  }

  async sendSentence(sentence: string): Promise<{[key: string]: {[key: string]: string | number}}> {
    this.wordsArray.set([{ value: 'Načítání..', type: 0, data: {} }]);
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
    this.wordsArray.set([]);
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
              Vzor: value['Vzor']
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
    }
    console.log(this.wordsArray());
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

  savedChoices: Choice2[] = [];

  saveChoices(value: any, type: any) {
    const kategorie = type.value;
    const hodnota = value.value;
    const slovo = this.clickedWord;

    const existingChoice = this.savedChoices.find(choice => choice.word === slovo);

    if (existingChoice) {
      existingChoice.data[kategorie] = hodnota;
    }
    else {
      this.savedChoices.push({
        word: slovo,
        data: { [kategorie]: hodnota }
      });
    }

    if (kategorie === 'Rod') {
      this.updateVzorChoices(hodnota);
    }
  }

  getSavedChoice(category: string): string | number | undefined {
    const existingChoice = this.savedChoices.find(choice => choice.word === this.clickedWord);
    return existingChoice?.data[category];
  }

  resetVariables() {
    this.clickedWordType = 0;
    this.clickedWord = '';
    this.savedChoices = [];
  }

  selectWord(word: Word) {
    if (word.type === 3) return;
    this.clickedWordType = word.type;
    this.clickedWord = word.value;
  }

  answersSubmitted: boolean = false;
  submitAnswers() {
    if (this.answersSubmitted) {
      this.resetVariables();
      this.answersSubmitted = false;
      console.log(this.mode)
      if (this.mode) {
        this.requestSentence();
      } else {
        this.returnBack();
      }
    } else {
      this.answersSubmitted = true;

      this.wordsArray.update(words => 
        words.map(word => {
          if (Object.keys(word.data).length === 0) {
            return { ...word, score: 10 };
          }
          return word;
        })
      );
      
      for (const savedChoice of this.savedChoices) {
        const wordIndex = this.wordsArray().findIndex(word => word.value === savedChoice.word);

        if (wordIndex !== -1) {
          const word = this.wordsArray()[wordIndex];
          const correctAnswers: { [key: string]: boolean } = {};
          let totalCorrect = 0;
          let totalAnswered = 0;

          for (const [category, userValue] of Object.entries(savedChoice.data)) {
            if (userValue !== '-') { // Skip if user didn't provide an answer
              totalAnswered++;
              
              // Get the correct value from the word's data
              const correctValue = word.data[category];
              
              // Handle case insensitivity for string comparisons
              let isCorrect = false;
              if (typeof userValue === 'string' && typeof correctValue === 'string') {
                isCorrect = userValue.toLowerCase() === correctValue.toLowerCase();
              } else {
                isCorrect = userValue === correctValue;
              }
              
              correctAnswers[category] = isCorrect;
              if (isCorrect) totalCorrect++;
            }
          }

          this.wordsArray.update(words => 
            words.map((w, idx) => 
              idx === wordIndex 
                ? { 
                    ...w, 
                    selectedChoices: savedChoice.data,
                    correctChoices: correctAnswers,
                    score: totalAnswered > 0 ? (totalCorrect / totalAnswered) : 0
                  }
                : w
            )
          );
        }
      }
    }
  }

  updateVzorChoices(selectedRod: string | undefined) {
    const vzorChoice = this.typeOneChoices().find(choice => choice.value === 'Vzor');

    if (!vzorChoice) return;

    const vzoryByRod: {[key: string]: (string)[]} = {
      'Mužský': ['-', 'Pán', 'Hrad', 'Muž', 'Stroj', 'Předseda', 'Soudce'],
      'Ženský': ['-', 'Žena', 'Růže', 'Píseň', 'Kost'],
      'Střední': ['-', 'Město', 'Moře', 'Kuře', 'Stavení']
    };

    if (selectedRod && selectedRod !== '-' && vzoryByRod[selectedRod as string]) {
      this.typeOneChoices.update(choices => 
        choices.map(choice => 
          choice.value === 'Vzor' 
            ? { ...choice, choices: vzoryByRod[selectedRod as string] }
            : choice
        )
      );

    } else {
      this.typeOneChoices.update(choices => 
        choices.map(choice => 
          choice.value === 'Vzor' 
            ? { ...choice, choices: ['-'] }
            : choice
        )
      );
    }
  }

  getEvaluationCategories(word: Word): string[] {
    if (!word.selectedChoices) return [];
    return Object.keys(word.selectedChoices).filter(key => 
      word.selectedChoices?.[key] !== '-'
    );
  }

  getCorrectValue(word: string, category: string): string {
  const selectedWord = this.wordsArray().find(w => w.value === word);
  if (!selectedWord || !selectedWord.data || !selectedWord.data[category]) {
    return '';
  }
  
  return selectedWord.data[category].toString();
}

  returnBack() {
    this.returningEvent.emit();
  }
}
