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
  recentlySent: boolean;
  visible: boolean;
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
      // Skip API calls during server-side rendering
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`https://code.dojc.cc/proxy/8000/profile/get-friends/${this.sharedService.username()}`);
      const data = await response.json();

      // Check if data is an array before iterating
      if (Array.isArray(data)) {
        for (const userObj of data) {
          this.friendsList.update(currentList => [...currentList, {
            username: userObj.username || 'Unknown',
            profilePic: `https://code.dojc.cc/proxy/8000/profile-images/${userObj.profile_picture}` || '',
            level: userObj.level || 1,
            visible: true,
          }]);
        }

        this.makeFriendsPages(this.friendsList());
      } else {
        console.error('Expected an array but got:', typeof data);
      }
    } catch (err) {
      console.error('Error fetching friends list:', err);
    }
  }

  async updateRequestsList() {
    this.requestsList.set([]);
    try {
      // Skip API calls during server-side rendering
      if (typeof window === 'undefined') {
        return;
      }
      
      const response = await fetch(`https://code.dojc.cc/proxy/8000/profile/usernames-levels-pictures`);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const allUsers = await response.json();
      
      // Check if allUsers is an array before proceeding
      if (!Array.isArray(allUsers)) {
        console.error('Expected an array of users but got:', typeof allUsers);
        return;
      }
      
      const requestsUsernames = this.sharedService.requests();
      
      if (!requestsUsernames || requestsUsernames.length === 0) {
        return;
      }
      
      for (const user of allUsers) {
        if (requestsUsernames.includes(user.username)) {
          this.requestsList.update(currentList => [...currentList, {
            username: user.username || 'Unknown',
            profilePic: `https://code.dojc.cc/proxy/8000/profile-images/${user.profile_picture}` || '',
            level: user.level || 1,
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
      const response = await fetch(`https://code.dojc.cc/proxy/8000/profile/usernames-levels-pictures`);
      const allUsers = await response.json();

      const response2 = await fetch(`https://code.dojc.cc/proxy/8000/profile/get-friends/${this.sharedService.username()}`);
      const friends = await response2.json();

      const friendUsernames = friends.map((friend: any) => friend.username);
      const currentUsername = this.sharedService.username();

      const matchedUsers = allUsers
        .filter((user: any) => 
          user.username.toLowerCase().includes(input.trim().toLowerCase())
        )
        .map((user: any) => ({
          username: user.username,
          profilePic: `https://code.dojc.cc/proxy/8000/profile-images/${user.profile_picture}`,
          level: user.level,
          nonFriend: (friendUsernames.includes(user.username) || user.username === currentUsername),
          recentlySent: false,
          visible: true
        }));
      
      this.foundUsers.set(matchedUsers);
      this.makeUsersPages(this.foundUsers());
      
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
  usersPageNum: number = 0;
  itemsPerPage: number = 0;

  updateLayoutBasedOnScreenSize(): void {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Default: 3x3 grid (9 items)
    let columns = 3;
    let rows = 3;
    
    // Adjust columns based on width
    if (screenWidth < 550) {
      columns = 1; // 1 column for very small screens
    } else if (screenWidth < 1110) {
      columns = 2; // 2 columns for medium screens
    }
    
    // Adjust rows based on height
    if (screenHeight < 715) {
      rows = 2; // Reduce rows when height is constrained
    }
    
    // Calculate new items per page
    console.log(rows)
    console.log(columns);
    this.itemsPerPage = columns * rows;
    console.log(this.itemsPerPage);
  }

  makeFriendsPages(list: any[]) {
    this.updateLayoutBasedOnScreenSize();
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
    this.updateLayoutBasedOnScreenSize();
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

  makeUsersPages(list: any[]) {
    this.updateLayoutBasedOnScreenSize();
    if (!list || list.length === 0) return;
    
    const updatedList = list.map((item, index) => {
      return {
        ...item,
        visible: index < this.itemsPerPage
      };
    });
    
    this.usersPageNum = 0;
    this.foundUsers.set(updatedList);
  }

  switchPage(direction: boolean, list: any[], users: boolean) {
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
    
    if (users) this.foundUsers.set(updatedList);
    else this.friendsList.set(updatedList);
  }

  getTotalPages(): number {
    return Math.ceil(this.friendsList().length / this.itemsPerPage);
  }

  async removeFriend(friend: string) {
    try {
      await fetch(`https://code.dojc.cc/proxy/8000/profile/remove-friend/${this.sharedService.username()}/${friend}`);
      await this.updateFriendsList();
    } catch (err) {console.error(err) }
  }

  async acceptRequest(user: string) {
    try {
      await fetch(`https://code.dojc.cc/proxy/8000/profile/add-friend/${this.sharedService.username()}/${user}`);
      window.location.reload();
    } catch (err) {console.error(err) }
  }
  async denyRequest(user: string) {
    try {
      await fetch(`https://code.dojc.cc/proxy/8000/profile/decline-friend-request/${this.sharedService.username()}/${user}`);
      window.location.reload();
    } catch (err) {console.error(err) }
  }
  async sendRequest(user: string) {
    try {
      const response = await fetch(`https://code.dojc.cc/proxy/8000/profile/add-friend-request/${this.sharedService.username()}/${user}`);
      if (response.ok) {
        this.foundUsers.update(users => 
          users.map(foundUser => 
            foundUser.username === user 
              ? { ...foundUser, recentlySent: true }
              : foundUser
          )
        );
      }
    } catch (err) {console.error(err) }
  }

  ngOnInit(): void {
    this.updateFriendsList();
  }
}
