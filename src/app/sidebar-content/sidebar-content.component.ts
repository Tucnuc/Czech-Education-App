import { NgStyle } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'
import { RouterModule } from '@angular/router';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-content',
  imports: [MatListModule, MatIconModule, MatButtonModule, RouterModule, NgStyle],
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

  profileName: string = 'Guest';
  loggedIn: boolean = false;
  profilePicture: string = 'images/default.png';
  profileRank: number = 0;

  sidebarCollapsed = signal(false);
  @Input() set collapsed(val: boolean) {
    this.sidebarCollapsed.set(val);
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