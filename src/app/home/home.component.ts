import { NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LexiconComponent } from "./lexicon/lexicon.component";

export type account = {
  name: string;
  level: number;
  img: string;
  online: boolean;
};

@Component({
  selector: 'app-home',
  imports: [NgClass, RouterLink, LexiconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  showingFriends = signal<account[]>([]);
  friendsList: account[] = [
    { name: 'John', level: 6, img: 'images/default.png', online: false },
    { name: 'Tom', level: 12, img: 'images/default.png', online: false },
    { name: 'Klaudie', level: 19, img: 'images/default.png', online: true },
    { name: 'Adam', level: 100, img: 'images/default.png', online: true },
    { name: 'Patrik', level: 54, img: 'images/default.png', online: false },
  ];

  ngOnInit(): void {
    const onlineUsers = this.friendsList.filter(user => user.online);
    const offlineUsers = this.friendsList.filter(user => !user.online);

    onlineUsers.sort((a, b) => a.name.localeCompare(b.name));
    offlineUsers.sort((a, b) => a.name.localeCompare(b.name));
  
    const sortedFriends = [...onlineUsers, ...offlineUsers].slice(0, 10);
    this.showingFriends.set(sortedFriends);
  }

  lexiconActive: boolean = false;
  selectedMode: string = '';
  
  openLexicon(mode: string) {
    this.selectedMode = mode;
    this.lexiconActive = true;
  }
}
