import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { SharedService } from '../../../shared/shared.service';

interface Word {
  value: string;
  type: number;
  data: {[key: string]: string | number};
  selectedChoices?: { [key: string]: string | number };
  correctChoices?: { [key: string]: boolean };
  score?: number;
  isPartOfSelected?: boolean;
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
  constructor(private sharedService: SharedService) { }

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
      value: 'Slovesný rod',
      choices: ['-', 'Činný', 'Nečinný'],
      class: 'medium'
    },
  ]);

  unformattedArray: { [key: string]: { [key: string]: string | number } } = {};
  veta: string = '';

  ngOnInit(): void {
    console.log(this.mode);
    if (this.mode !== 'custom') {
      this.requestSentence();
    } 
  }

  alreadyRequesting: boolean = false;
  async requestSentence(retryCount: number = 0, maxRetries: number = 3) {
    if (retryCount === 0) this.alreadyRequesting = true;

    this.wordsArray.set([{ value: 'Generování..', type: 0, data: {} }]);

    try {
      const response = await fetch(`https://code.dojc.cc/proxy/8000/generate/${this.mode}`);
      const data = await response.json();
      // console.log(data)
      this.veta = data.sentence;
      this.formatSentence(data.morph);
    } catch (err) {
      console.error(`Attempt ${retryCount + 1} failed:`, err);

      if (retryCount < maxRetries) {
        const retryDelay = 1000 * (retryCount + 1);

        this.wordsArray.set([{ value: `Opakuji, pokus ${retryCount + 1}...`, type: 10, data: {} }]);

        setTimeout(() => {
          this.requestSentence(retryCount + 1, maxRetries);
        }, retryDelay);
      } else {
        this.wordsArray.set([{ value: 'Chyba připojení k serveru', type: 10, data: {} }]);
        this.alreadyRequesting = false;
      }
    }
  }

  async sendSentence(sentence: string): Promise<{[key: string]: {[key: string]: string | number}}> {
    this.wordsArray.set([{ value: 'Načítání..', type: 0, data: {} }]);
    try {
      const response = await fetch(`https://code.dojc.cc/proxy/8000/morph/${encodeURIComponent(sentence)}`);
      const data = await response.json();
      console.log(data);
      this.veta = data.sentence;
      return data.morph;
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  formatSentence(morphData: {[key: string]: {[key: string]: string | number}}) {
    this.wordsArray.set([]);
    this.unformattedArray = morphData;
    const sentence = this.veta;
    
    // Split the sentence into words
    const words = sentence.split(/\s+/);
    
    // Process each word from the sentence
    for (const word of words) {
      let wordWithoutPunctuation = word.replace(/[.,!?;:]/g, '');
      let punctuation = word.match(/[.,!?;:]/g);
      
      // Check if this word is in morphData directly
      if (morphData[wordWithoutPunctuation]) {
        // Word exists directly in morphData
        const data = morphData[wordWithoutPunctuation];
        let type = this.determineWordType(data);
        
        this.wordsArray.update(words => [
          ...words,
          { value: wordWithoutPunctuation, type, data }
        ]);
      } else {
        // Check if this word is part of a combined form
        let foundInCombined = false;
        
        for (const [morphKey, morphValue] of Object.entries(morphData)) {
          if (morphKey.includes(wordWithoutPunctuation) && morphKey.includes(' ')) {
            // This word is part of a combined form
            const parts = morphKey.split(' ');
            if (parts.includes(wordWithoutPunctuation)) {
              let type = this.determineWordType(morphValue);
              
              this.wordsArray.update(words => [
                ...words,
                { value: wordWithoutPunctuation, type, data: morphValue }
              ]);
              
              foundInCombined = true;
              break;
            }
          }
        }
        
        if (!foundInCombined) {
          // Word not found in morphData
          this.wordsArray.update(words => [
            ...words,
            { value: wordWithoutPunctuation, type: 3, data: {} }
          ]);
        }
      }
      
      // Add punctuation as a separate word if it exists
      if (punctuation && punctuation.length > 0) {
        this.wordsArray.update(words => [
          ...words,
          { value: punctuation[0], type: 3, data: {} }
        ]);
      }
    }
    
    this.alreadyRequesting = false;
  }

  // Helper method to determine word type based on morphological data
  determineWordType(data: {[key: string]: string | number}): number {
    const keys = Object.keys(data);
    
    if (keys.includes('Pád')) {
      return 1; // Noun or adjective (type 1)
    } else if (keys.includes('Vid') || keys.includes('Čas') || keys.includes('Osoba')) {
      // Special handling for infinitive forms - if verb has ONLY Vid and nothing else important
      if (keys.includes('Vid') && 
          !keys.includes('Čas') && 
          !keys.includes('Osoba') && 
          !keys.includes('Způsob') && 
          !keys.includes('Rod')) {
        // Clear all data for infinitive verbs
        Object.keys(data).forEach(key => {
          delete data[key];
        });
        return 2; // Still mark as verb (type 2) but with no data
      }


      // For verbs, rename 'Rod' to 'Slovesný rod' to avoid confusion with noun gender
      if (keys.includes('Rod')) {
        // Create a copy of the data object
        const modifiedData = {...data};
        // Set the 'Slovesný rod' property to the value of 'Rod'
        modifiedData['Slovesný rod'] = modifiedData['Rod'];
        // Delete the original 'Rod' property
        delete modifiedData['Rod'];
        // Assign the modified data back
        Object.assign(data, modifiedData);
      }
      return 2; // Verb (type 2)
    } else {
      return 3; // Other (type 3)
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
    if (this.clickedWord === this.clickedWordDisplay) {
      const existingChoice = this.savedChoices.find(choice => choice.word === this.clickedWord);
      return existingChoice?.data[category];
    } else {
      // For multi-word expressions - find appropriate choice based on the display value
      const isMultiWord = this.clickedWordDisplay.includes(' ');
      
      if (isMultiWord) {
        // If this is a multi-word, find choices for any part of the multi-word
        // First check if we have a choice for the full multi-word expression
        let existingChoice = this.savedChoices.find(choice => choice.word === this.clickedWordDisplay);
        
        // If not found and this is a specific part of a multi-word, look for choices for any part
        if (!existingChoice) {
          // Look for choices made for any part of this multi-word
          const parts = this.clickedWordDisplay.split(' ');
          for (const part of parts) {
            existingChoice = this.savedChoices.find(choice => choice.word === part);
            if (existingChoice) break;
          }
        }
        
        // If we found a choice for any part of the multi-word, use that
        return existingChoice?.data[category];
      }
      
      return undefined;
    }
  }

  clickedWordDisplay: string = '';
  resetVariables() {
    this.clickedWordType = 0;
    this.clickedWord = '';
    this.clickedWordDisplay = '';
    this.savedChoices = [];
  }

  selectWord(word: Word) {
    if (word.type === 3) return;
    
    // Look for multi-word expressions containing this word
    let multiWordKey: string | null = null;
    let multiWordValue: any = null;
    
    // Iterate through morphData to find multi-word expressions
    for (const [morphKey, morphValue] of Object.entries(this.unformattedArray)) {
      if (morphKey.includes(' ') && morphKey.split(' ').includes(word.value)) {
        multiWordKey = morphKey;
        multiWordValue = morphValue;
        break;
      }
    }
    
    if (multiWordKey) {
      // If it's part of a multi-word expression, use the full expression as clickedWord
      this.clickedWordType = word.type;
      this.clickedWord = word.value;
      this.clickedWordDisplay = multiWordKey;
      
      // Highlight all words in the multi-word expression
      const multiWordArray = multiWordKey.split(' ');
      this.wordsArray.update(words => 
        words.map(w => ({
          ...w,
          isPartOfSelected: multiWordArray.includes(w.value)
        }))
      );
    } else {
      // Normal single-word behavior
      this.clickedWordType = word.type;
      this.clickedWord = word.value;
      this.clickedWordDisplay = word.value;
      
      // Clear any multi-word highlighting
      this.wordsArray.update(words => 
        words.map(w => ({
          ...w,
          isPartOfSelected: w.value === word.value
        }))
      );
    }
  }

  answersSubmitted: boolean = false;
  submitAnswers() {
    if (this.answersSubmitted) {
      this.resetVariables();
      this.answersSubmitted = false;
      if (this.mode) {
        this.requestSentence();
      } else {
        this.returnBack();
      }
    } else {
      this.answersSubmitted = true;

      // Tracking variables for XP calculations
      let totalWords = 0;
      let correctWords = 0;
      let totalCorrectCategories = 0;
      
      // Reset word scoring + infinitiv
      this.wordsArray.update(words => 
        words.map(word => {
          // Handle infinitives - words with empty data that are type 1 (noun/adj) or 2 (verb)
          if (Object.keys(word.data).length === 0 && (word.type === 1 || word.type === 2)) {
            totalWords++;
            
            // Check if this word is part of a multi-word expression
            let isPartOfMultiWord = false;
            let multiWordKey = null;
            
            // Check if this infinitive is part of a multi-word expression
            for (const [morphKey, morphValue] of Object.entries(this.unformattedArray)) {
              if (morphKey.includes(' ') && morphKey.split(' ').includes(word.value)) {
                isPartOfMultiWord = true;
                multiWordKey = morphKey;
                break;
              }
            }
            
            // Check if any part of a multi-word expression was selected
            let userSelectedThisWord = false;
            
            if (isPartOfMultiWord && multiWordKey) {
              const multiWordParts = multiWordKey.split(' ');
              
              // Check if user made a selection for any part of this multi-word
              for (const part of multiWordParts) {
                if (this.savedChoices.some(choice => choice.word === part)) {
                  userSelectedThisWord = true;
                  break;
                }
              }
            } else {
              // Regular word - check if user selected it
              userSelectedThisWord = this.savedChoices.some(choice => choice.word === word.value);
            }
            
            // If user didn't interact with this word (correct for infinitives)
            if (!userSelectedThisWord) {
              correctWords++;
              return { ...word, score: 1 };
            } else {
              // User tried to categorize an infinitive (incorrect)
              return { ...word, score: 0 };
            }
          }
          
          // For regular words with no data (like punctuation)
          else if (Object.keys(word.data).length === 0) {
            return { ...word, score: 10 };
          }
          return word;
        })
      );
      
      // Process each saved choice
      for (const savedChoice of this.savedChoices) {
        const wordIndex = this.wordsArray().findIndex(word => word.value === savedChoice.word);

        if (wordIndex !== -1) {
          const word = this.wordsArray()[wordIndex];
          const correctAnswers: { [key: string]: boolean } = {};
          let totalCorrect = 0;
          let totalAnswered = 0;

          // Count this as a word being evaluated
          totalWords++;
          
          for (const [category, userValue] of Object.entries(savedChoice.data)) {
            const correctValue = word.data[category];
            let isCorrect = false;
            
            if (userValue === '-' && (!correctValue || correctValue === '' || correctValue === '-')) {
              isCorrect = true;
              totalAnswered++;
            }
            else if (userValue !== '-') {
              totalAnswered++;
              
              if (typeof userValue === 'string' && typeof correctValue === 'string') {
                isCorrect = userValue.toLowerCase() === correctValue.toLowerCase();
              } else {
                isCorrect = userValue === correctValue;
              }
              
              correctAnswers[category] = isCorrect;
              
              // Count correct categories for XP
              if (isCorrect) {
                totalCorrect++;
                totalCorrectCategories++;
              }
            }
          }

          // A word is fully correct if all answered categories are correct
          const wordFullyCorrect = totalAnswered > 0 && totalCorrect === totalAnswered;
          if (wordFullyCorrect) {
            correctWords++;
          }

          // Update the word with results
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

          // Now check if this word is part of a multi-word expression
          // If so, apply the same score and evaluation results to all parts
          for (const [morphKey, morphValue] of Object.entries(this.unformattedArray)) {
            if (morphKey.includes(' ') && morphKey.split(' ').includes(word.value)) {
              // This is a multi-word expression
              const multiWordParts = morphKey.split(' ');
              
              // Apply results to all parts of this multi-word expression
              for (const part of multiWordParts) {
                if (part !== word.value) {  // Skip the word we just processed
                  const partIndex = this.wordsArray().findIndex(w => w.value === part);
                  
                  if (partIndex !== -1) {
                    // Apply the same evaluation results to this part of the multi-word
                    this.wordsArray.update(words => 
                      words.map((w, idx) => 
                        idx === partIndex 
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
              
              break; // Once we found a matching multi-word, no need to check others
            }
          }
        }
      }
      
      // Calculate and award XP
      if (totalWords > 0 && this.sharedService.loggedIn()) {
        this.awardXP(totalCorrectCategories, correctWords, totalWords);
      }
    }
  }

  private awardXP(correctCategories: number, correctWords: number, totalWords: number): void {
    if (!this.sharedService.loggedIn()) return;
    // Base XP calculation:
    // - 2 XP per correct category
    // - Additional 3 XP per fully correct word
    let xpGain = (correctCategories * 2) + (correctWords * 3);
    
    // Perfect sentence bonus (1.2× multiplier)
    if (correctWords === totalWords && totalWords > 0) {
      xpGain = Math.floor(xpGain * 1.2);
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
    
    // Get current user stats
    const currentXP = this.sharedService.xp();
    const currentLevel = this.sharedService.level();
    const maxXP = this.sharedService.maxXP();
    
    // Calculate new XP
    let newXP = currentXP + xpGain;
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