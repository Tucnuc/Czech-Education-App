import { NgClass, NgStyle } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Output, signal, ViewChild, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedService } from '../../../shared/shared.service';

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
  constructor(private sharedService: SharedService) { }

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
      const response = await fetch(`https://code.dojc.cc/proxy/8000/generate/${this.mode}`);
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
        this.alreadyRequesting = false;
      }
    }
  }

  async sendSentence(sentence: string): Promise<{ [key: string]: number }> {
    this.wordsArray.set([{ value: 'Načítání..', type: 0 }]);
    try {
      const response = await fetch(`https://code.dojc.cc/proxy/8000/pos/${encodeURIComponent(sentence)}`);
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
      // Reset and move to next question logic (keep as is)
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
      // Calculate results and award XP
      this.answersSubmitted = true;
      
      // Count correct answers
      let correctAnswers = 0;
      let totalAnswerable = 0;
      
      this.wordsArray.update((words) =>
        words.map((word) => {
          // Skip words with type 0 (punctuation/non-categorized)
          if (word.type === 0) {
            return word;
          }
          
          totalAnswerable++;
          
          // Check if answer is correct
          if (word.type === word.chosenType) {
            correctAnswers++;
            return { ...word, color: 'green' };
          } else {
            return { ...word, color: 'red' };
          }
        })
      );
      
      // Calculate XP gain
      if (totalAnswerable > 0) {
        let xpGain = correctAnswers * 5; // Base XP: 5 per correct word
        
        // Perfect score bonus (1.1× multiplier)
        if (correctAnswers === totalAnswerable) {
          xpGain = Math.floor(xpGain * 1.1);
        }
        
        // Apply difficulty multiplier
        let difficultyMultiplier = 1;
        switch (this.mode) {
          case 'easy':
            difficultyMultiplier = 0.5;
            break;
          case 'normal':
            difficultyMultiplier = 1;
            break;
          case 'hard':
            difficultyMultiplier = 1.5;
            break;
          default:
            difficultyMultiplier = 0.25;
        }
        
        xpGain = Math.floor(xpGain * difficultyMultiplier);
        
        // Award XP to user
        if (xpGain > 0) {
          this.awardXP(xpGain);
        }
      }
      
      // Reset selection state
      this.druhy.update((druhy) =>
        druhy.map((druh) => ({ ...druh, selected: false }))
      );
    }
  }

  awardXP(xpAmount: number): void {
    // Only award XP if user is logged in
    if (!this.sharedService.loggedIn()) return;
    
    // Get current user stats
    const currentXP = this.sharedService.xp();
    const currentLevel = this.sharedService.level();
    const maxXP = this.sharedService.maxXP();
    
    // Calculate new XP
    let newXP = currentXP + xpAmount;
    let newLevel = currentLevel;
    
    // Check for level up
    if (newXP >= maxXP) {
      newXP -= maxXP;
      newLevel++;
    }
    
    // Update user stats
    this.sharedService.updateAccountInfo({
      level: newLevel,
      xp: newXP
    });
    
    this.saveUserProgress(newLevel, newXP);
  }

  async saveUserProgress(level: number, xp: number): Promise<void> {
    try {
      await fetch(`https://code.dojc.cc/proxy/8000/profile/update_progress/${this.sharedService.username()}/${xp}/${level}`);
    } catch (err) { console.error('Failed to save progress:', err) }
  }

  returnBack() {
    this.returningEvent.emit();
  }
}
