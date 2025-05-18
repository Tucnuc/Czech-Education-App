import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedService } from '../../shared/shared.service';
import { NgClass } from '@angular/common';

interface Friend {
  username: string;
  profilePic: string;
  level: number;
}

@Component({
  selector: 'app-friends',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatIconModule, MatButtonModule, NgClass],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss'
})
export class FriendsComponent implements OnInit {
  constructor(public sharedService: SharedService) { }

  friendsList = signal<Friend[]>([]);
  activeTab: string = 'friends';
  displays: string[] = ['Přátelé', 'přátele']

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'friends') this.displays = ['Přátelé', 'přátele'];
    else this.displays = ['Žádosti', 'žádosti'];
  }

  async updateFriendsList() {
    this.friendsList.set([]);
    try {
      const response = await fetch(`http://localhost:8000/profile/usernames-levels-pictures`);
      const data = await response.json();
      const friends = this.sharedService.friends();

      for (const userObj of data) {
        if (friends.includes(userObj.username)) {
          this.friendsList.update(currentList => [...currentList, {
            username: userObj.username,
            profilePic: userObj.profile_picture,
            level: userObj.level,
          }]);
        }
      }
      
    } catch (err) {console.error(err) }
  }

  ngOnInit(): void {
    this.updateFriendsList();
  }
}
