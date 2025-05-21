import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  imports: [MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule, MatFormFieldModule, MatInputModule],
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

  returnBack() {
    this.changingData = false;
  }

  changingData: boolean = false;
  changeType: string = '';
  displayValue: string = '';

  changeValue: string = '';
  passwordValue: string = '';

  passError: boolean = false;
  valueError: boolean = false;

  changeSuccessful: boolean = false;
  successDisplay: string = '';

  resetVariables() {
    this.changeValue = '';
    this.passwordValue = '';
    this.passError = false;
    this.valueError = false;
    this.changeSuccessful = false;
  }

  changeUsername() {
    this.changingData = true;
    this.displayValue = 'jména';
    this.changeType = 'username';
    this.successDisplay = 'Jméno';
    this.resetVariables();
  }
  changePassword() {
    this.changingData = true;
    this.displayValue = 'hesla';
    this.changeType = 'password';
    this.successDisplay = 'Heslo';
    this.resetVariables();
  }

  async requestChange() {
    this.passError = false;
    this.valueError = false;
    if (this.passwordValue.trim() === '') {
      this.passError = true;
      return;
    }
    if (this.changeValue.trim() === '') {
      this.valueError = true;
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/profile/get-user-data/${this.sharedService.username()}`);
      const data = await response.json();
      const password = data.password;
      if (password !== this.passwordValue) {
        this.passError = true;
        this.changeValue = '';
        this.passwordValue = '';
        return;
      }

      if (this.changeType == 'username') {
        if (this.changeValue == this.sharedService.username()) {
          this.valueError = true;
          this.changeValue = '';
          return;
        }

        if (this.changeValue == 'Guest' || this.changeValue == 'guest') {
          this.valueError = true;
          this.changeValue = '';
          return;
        }

        try {
          const response = await fetch(`http://localhost:8000/profile/usernames`);
          const usernames = await response.json();

          if (usernames.includes(this.changeValue) || this.changeValue.length < 4 || this.changeValue.length > 16) {
            this.valueError = true;
            this.changeValue = '';
            return;
          }

          await fetch(`http://localhost:8000/profile/change-login/${this.sharedService.username()}/${this.changeValue}/${password}`);
          this.sharedService.updateAccountInfo({ username: this.changeValue });
          this.changeSuccessful = true;

        } catch (err) { console.error(err) }
      }

      else {
        if (this.changeValue == password || this.changeValue.length < 4) {
          this.valueError = true;
          this.changeValue = '';
          return;
        }

        try {
          await fetch(`http://localhost:8000/profile/change-login/${this.sharedService.username()}/${this.sharedService.username()}/${this.changeValue}`);
          this.changeSuccessful = true;
        } catch (err) { console.error(err) }
      }

    } catch (err) { console.error(err) }
  }

  // Dodělat změny username + password
}
