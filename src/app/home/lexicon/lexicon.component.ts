import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lexicon',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './lexicon.component.html',
  styleUrl: './lexicon.component.scss'
})
export class LexiconComponent {
  @Input() mode: string = '';
  @Output() returnEvent = new EventEmitter<boolean>();

  returnBack() { this.returnEvent.emit(false); }
}
