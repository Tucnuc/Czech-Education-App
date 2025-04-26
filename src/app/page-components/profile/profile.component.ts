import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileName: string = 'Guest';
  loggedIn: boolean = false;
  profilePicture: string = 'images/default.png';
  profileRank: number = 0;
  totalXP: number = 0;

  darkMode: boolean = false;
}
