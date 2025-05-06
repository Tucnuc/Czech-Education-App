import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lexicon',
  imports: [],
  templateUrl: './lexicon.component.html',
  styleUrl: './lexicon.component.scss'
})
export class LexiconComponent {
 @Input() mode: string = '';
}
