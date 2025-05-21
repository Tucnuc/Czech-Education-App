import { NgStyle } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'
import { RouterModule, Router } from '@angular/router';
import { SharedService } from '../shared/shared.service';
import { TruncatePipe } from '../shared/pipes/truncate.pipe';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-content',
  imports: [MatListModule, MatIconModule, MatButtonModule, RouterModule, NgStyle, TruncatePipe],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss',
  animations: [
    trigger('fading', [
      state('collapsed', style({ display: 'none', opacity: 0 })),
      state('expanded', style({ display: 'flex', opacity: 1 })),
      transition('collapsed => expanded', [animate('500ms ease-in-out')]),
    ]),
  ]
})
export class SidebarContentComponent {
  constructor(private router: Router, public sharedService: SharedService) { }

  sidebarCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sidebarCollapsed.set(val);
  }

  navigateToLogin() {
    if (this.sharedService.loggedIn()) this.sharedService.logoutUser();
    else this.router.navigate(['/account']);
  }

  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Home',
      route: 'home',
    },
    {
      icon: 'person',
      label: 'Profil',
      route: 'profile',
    },
    {
      icon: 'group',
      label: 'Přátelé',
      route: 'friends',
    },
    {
      icon: 'text_fields',
      label: 'Slovní Druhy',
      route: 'slovni-druhy',
    },
    {
      icon: 'category',
      label: 'Mluvnické Kategorie',
      route: 'kategorie',
    },
    {
      icon: 'leaderboard',
      label: 'Leaderboard',
      route: 'leaderboard',
    },
  ]);
}