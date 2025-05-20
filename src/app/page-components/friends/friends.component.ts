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
  visible: boolean;
}
interface User {
  username: string;
  profilePic: string;
  level: number;
  nonFriend: boolean;
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
  requestsList = signal<Friend[]>([]);
  activeTab: string = 'friends';
  displays: string[] = ['Přátelé', 'přátele']
  inputDisplay: string = '';

  async setActiveTab(tab: string) {
    this.activeTab = tab;
    this.inputDisplay = '';
    if (tab === 'friends') {
      this.displays = ['Přátelé', 'přátele'];
      await this.updateFriendsList();
    } else {
      this.displays = ['Žádosti', 'žádosti'];
      await this.updateRequestsList();
    }
  }

  async updateFriendsList() {
    this.friendsList.set([]);
    try {
      const response = await fetch(`http://localhost:8000/profile/get-friends/${this.sharedService.username()}`);
      const data = await response.json();

      for (const userObj of data) {
        this.friendsList.update(currentList => [...currentList, {
          username: userObj.username,
          profilePic: userObj.profile_picture,
          level: userObj.level,
          visible: true,
        }]);
      }

      this.makeFriendsPages(this.friendsList());
      
    } catch (err) {console.error(err) }
  }

  async updateRequestsList() {
    this.requestsList.set([]);
    try {
      const response = await fetch(`http://localhost:8000/profile/usernames-levels-pictures`);
      const allUsers = await response.json();
      
      const requestsUsernames = this.sharedService.requests();
      
      if (!requestsUsernames || requestsUsernames.length === 0) {
        return;
      }
      
      for (const user of allUsers) {
        if (requestsUsernames.includes(user.username)) {
          this.requestsList.update(currentList => [...currentList, {
            username: user.username,
            profilePic: user.profile_picture,
            level: user.level,
            visible: true,
          }]);
        }
      }
      
      this.makeRequestsPages(this.requestsList());
      
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  }

  searchFriends(input: string) {
    const updatedList = this.friendsList().map(friend => {
      if (!input.trim()) {
        return { ...friend, visible: true };
      }

      return { 
        ...friend, 
        visible: friend.username.toLowerCase().includes(input.toLowerCase())
      };
    });
    
    this.friendsList.set(updatedList);
  }

  searching: boolean = false;
  searchDisplay: string = '';
  foundUsers = signal<User[]>([]);

  async searchUsers() {
    const input = this.searchValue;
    if (!input.trim()) {
      this.searching = false;
      this.foundUsers.set([]);
      return;
    }

    this.searching = true;
    this.searchDisplay = input.trim();

    try {
      const response = await fetch(`http://localhost:8000/profile/usernames-levels-pictures`);
      const allUsers = await response.json();

      const response2 = await fetch(`http://localhost:8000/profile/get-friends/${this.sharedService.username()}`);
      const friends = await response2.json();

      const friendUsernames = friends.map((friend: any) => friend.username);
      const currentUsername = this.sharedService.username();

      const matchedUsers = allUsers
        .filter((user: any) => 
          user.username.toLowerCase().includes(input.trim().toLowerCase())
        )
        .map((user: any) => ({
          username: user.username,
          profilePic: user.profile_picture,
          level: user.level,
          nonFriend: (friendUsernames.includes(user.username) || user.username === currentUsername)
        }));
      
      this.foundUsers.set(matchedUsers);
      
    } catch (err) {
      console.error('Error searching for users:', err);
      this.foundUsers.set([]);
    }
  }

  searchValue: string = '';
  returnBack() {
    this.searching = false;
    this.searchDisplay = '';
    this.searchValue = '';
  }


  pageNum: number = 0;
  requestsPageNum: number = 0;
  itemsPerPage: number = 9;

  makeFriendsPages(list: any[]) {
    if (!list || list.length === 0) return;
    
    const updatedList = list.map((item, index) => {
      return {
        ...item,
        visible: index < this.itemsPerPage
      };
    });
    
    this.pageNum = 0;
    this.friendsList.set(updatedList);
  }

  makeRequestsPages(list: any[]) {
    if (!list || list.length === 0) return;
    
    const updatedList = list.map((item, index) => {
      return {
        ...item,
        visible: index < this.itemsPerPage
      };
    });
    
    this.requestsPageNum = 0;
    this.requestsList.set(updatedList);
  }

  switchPage(direction: boolean, list: any[]) {
    const totalPages = Math.ceil(list.length / this.itemsPerPage);
    
    if (direction) {
      if (this.pageNum < totalPages - 1) {
        this.pageNum += 1;
      } else {
        return;
      }

    } else {
      if (this.pageNum > 0) {
        this.pageNum -= 1;
      } else {
        return;
      }
    }
    
    const startIndex = this.pageNum * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    const updatedList = list.map((item, index) => {
      return {
        ...item,
        visible: index >= startIndex && index < endIndex
      };
    });
    
    this.friendsList.set(updatedList);
  }

  getTotalPages(): number {
    return Math.ceil(this.friendsList().length / this.itemsPerPage);
  }

  async removeFriend(friend: string) {
    try {
      await fetch(`http://localhost:8000/profile/remove-friend/${this.sharedService.username()}/${friend}`);
      await this.updateFriendsList();
    } catch (err) {console.error(err) }
  }

  ngOnInit(): void {
    this.updateFriendsList();
  }
}
