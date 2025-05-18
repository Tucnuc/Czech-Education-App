import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LexiconComponent } from "./lexicon/lexicon.component";
import { SharedService } from '../shared/shared.service';

export type Friend = {
  username: string;
  level: number;
  profilePic: string;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, LexiconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(public sharedService: SharedService) { }

  filteredFriends = signal<Friend[]>([]);

  async updateFriends() {
    this.filteredFriends.set([]);
    try {
      const response = await fetch(`http://localhost:8000/profile/usernames-levels-pictures`);
      const data = await response.json();
      const friends = this.sharedService.friends();

      const chosenFriends: Friend[] = [];
      for (const userObj of data) {
        if (friends.includes(userObj.username)) {
          chosenFriends.push({
            username: userObj.username,
            profilePic: userObj.profile_picture,
            level: userObj.level,
          });
        }
      }

      chosenFriends.sort((a, b) => a.username.localeCompare(b.username));

      const sortedFriends = [...chosenFriends].slice(0, 10);
      this.filteredFriends.set(sortedFriends);
      
    } catch (err) {console.error(err) }
  }

  ngOnInit(): void {
    this.updateFriends();
  }

  lexiconActive: boolean = false;
  selectedMode: string = '';
  
  openLexicon(mode: string) {
    this.selectedMode = mode;
    this.lexiconActive = true;
  }
}
