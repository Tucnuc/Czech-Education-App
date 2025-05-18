import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';

interface Account {
  username: string;
  profilePicture: string;
  darkmode: boolean;
  friends: string[];
  level: number;
  xp: number;
  loggedIn: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  darkMode: boolean = false;

  constructor(private router: Router, public sharedService: SharedService) {
    this.darkMode = this.sharedService.darkmode();
  }

  async toggleDarkMode() {
    const newDarkModeValue = !this.sharedService.darkmode();
    this.darkMode = newDarkModeValue;
    this.sharedService.updateAccountInfo({ darkmode: newDarkModeValue });
    try {
      await fetch(`http://localhost:8000/profile/darkmode/${this.sharedService.username()}/${this.sharedService.darkmode()}`); 
    } catch (err) { console.error(err) }
  }

  navigateToLogin() {
    if (this.sharedService.loggedIn()) {
      this.sharedService.logoutUser();
    } else {
      this.router.navigate(['/account']);
    }
  }
}
