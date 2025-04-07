import { Component } from '@angular/core';
import { ChoiceBtnsComponent } from '../choice-btns/choice-btns.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-kategorie',
  imports: [ChoiceBtnsComponent, NgClass],
  templateUrl: './kategorie.component.html',
  styleUrl: './kategorie.component.scss'
})
export class KategorieComponent {
  isReady = true

  wordsArray = ["Kočka","leze","dírou,","pes","oknem,","pes","oknem."]
}
