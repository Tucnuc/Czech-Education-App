import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';

interface Check {
  nameCheck: boolean,
  passwordCheck: boolean,
  loginName: boolean,
  loginPass: boolean,
}

interface Account {
  username: string;
  profilePicture: string;
  darkmode: boolean;
  requests: string[];
  level: number;
  xp: number;
  loggedIn: boolean;
}

@Component({
  selector: 'app-account',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  constructor(private router: Router, public sharedService: SharedService) { }

  register: boolean = false;
  recentlyRegistered: boolean = false;
  accountData: any = {};
  usernames: string[] = [];

  name: string = '';
  password: string = '';
  passwordConfirm: string = '';

  heading: string = 'Přihlášení';
  bottomTexts: string[] = [];

  checks: Check = {
    nameCheck: false,
    passwordCheck: false,
    loginName: false,
    loginPass: false,
  };

  checkPasswords() {
    if (!this.register) return;
    if (this.password === this.passwordConfirm && this.password.length > 3) this.checks.passwordCheck = true;
    else this.checks.passwordCheck = false;
  }

  checkName() {
    if (!this.register) return;
    if (this.name == 'Guest' || this.name == 'guest') return;
    if (this.usernames) {
      if (this.usernames.find(username => username === this.name) || this.name.length < 4 || this.name.length > 16) this.checks.nameCheck = false;
      else this.checks.nameCheck = true;
    }
  }

  resetVariables() {
    this.name = '';
    this.password = '';
    this.passwordConfirm = '';
    this.checks.nameCheck = false;
    this.checks.passwordCheck = false;
  }

  updatePage(clicked: boolean) {
    if (clicked) {
      this.register = !this.register;
    }

    this.resetVariables();

    if (this.register) {
      this.heading = 'Registrace';
      this.bottomTexts = ['Už máte účet?', 'Přihlašte se'];
      this.getUsernames();
    } else {
      this.heading = 'Přihlášení';
      this.bottomTexts = ['Ještě nemáte účet?', 'Zaregistrujte se'];
    }
  }

  async proceed() {
    if (this.register) {
      if (this.checks.nameCheck && this.checks.passwordCheck) {
        try {
          await fetch(`http://localhost:8000/profile/register/${this.name}/${this.password}`);
          this.recentlyRegistered = true;
          this.updatePage(true);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      this.checks.loginName = false;
      this.checks.loginPass = false;

      try {
        const response: any = await fetch(`http://localhost:8000/profile/login/${this.name}/${this.password}`);
        const data = await response.json();
        if (data.error) {
          if (data.error === 'Špatné heslo') this.checks.loginPass = true;
          else this.checks.loginName = true;
          return
        }

        const formattedData: Account = {
          username: data.username,
          profilePicture: data.profile_picture,
          darkmode: data.darkmode,
          requests: data.friends_requests,
          level: data.level,
          xp: data.xp,
          loggedIn: true
        };

        this.sharedService.setAccountInfo(formattedData);
        this.router.navigate(['/profile']);
      
      } catch (err) { console.log(err) }
    }
  }

  async getUsernames() {
    try {
      const response = await fetch(`http://localhost:8000/profile/usernames`);
      const data = await response.json();
      console.log(data)
      this.usernames = data;
    } catch (err) {
      console.error(err);
    }
  }

  ngOnInit(): void {
    this.updatePage(false);
  }
}
