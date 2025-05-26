import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LexiconComponent } from "./lexicon/lexicon.component";
import { SharedService } from '../shared/shared.service';
import { TruncatePipe } from '../shared/pipes/truncate.pipe';
import { isPlatformBrowser } from '@angular/common';

export type Friend = {
  username: string;
  level: number;
  profilePic: string;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, LexiconComponent, TruncatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(public sharedService: SharedService, @Inject(PLATFORM_ID) private platformId: Object) { }

  filteredFriends = signal<Friend[]>([]);
  friends: Friend[] = [];

  async updateFriends() {
    this.filteredFriends.set([]);
    this.friends = []; // Reset friends array at the beginning
    
    try {
      // Skip API calls during server-side rendering
      if (!isPlatformBrowser(this.platformId)) {
        // Set empty or mock data for SSR
        this.filteredFriends.set([]);
        return;
      }
      
      const response = await fetch(`http://localhost:8000/profile/get-friends/${this.sharedService.username()}`);
      const data = await response.json();

      // Check if data is an array before iterating
      if (Array.isArray(data)) {
        for (const userObj of data) {
          this.friends.push({
            username: userObj.username || 'Unknown',
            profilePic: userObj.profile_picture || '',
            level: userObj.level || 1,
          });
        }

        this.friends.sort((a, b) => a.username.localeCompare(b.username));

        let numberOfFriends = 9;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        if (screenWidth < 660 || screenHeight < 550) {
          numberOfFriends = 3;
        } else if (screenWidth < 1200) {
          numberOfFriends = 6;
        }

        const sortedFriends = [...this.friends].slice(0, numberOfFriends);
        this.filteredFriends.set(sortedFriends);
      } else {
        console.error('Expected an array but got:', typeof data);
        this.filteredFriends.set([]);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
      this.filteredFriends.set([]);
    }
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
