import { Component, OnInit, signal } from '@angular/core';

export type Finalist = {
  username: string;
  level: number;
}

@Component({
  selector: 'app-leaderboard',
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  finalists = signal<Finalist[]>([]);

  async updateLeaderboard() {
    try {
      const response = await fetch(`https://code.dojc.cc/proxy/8000/leaderboard`); 
      const data = await response.json();
      const formattedData: Finalist[] = []

      for (const user of data) {
        formattedData.push({
          username: user.username,
          level: user.level,
        });
      }

      this.finalists.set(formattedData);
    } catch (err) { console.error(err) }
  }

  ngOnInit(): void {
    this.updateLeaderboard();
  }
}
