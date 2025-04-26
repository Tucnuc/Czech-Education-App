import { Component, OnInit, signal } from '@angular/core';

export type account = {
  name: string;
  level: number;
}

@Component({
  selector: 'app-leaderboard',
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  finalists = signal<account[]>([]);
  userList = signal<account[]>([
    { name: 'John', level: 6 },
    { name: 'Patrik', level: 54 },
    { name: 'Klaudie', level: 19 },
    { name: 'Adam', level: 100 },
  ]);

  ngOnInit(): void {
    const sortedUsers = this.userList()
      .sort((a, b) => b.level - a.level);
    const topUsers = sortedUsers.slice(0, 10);
    this.finalists.set(topUsers);
  }
}
