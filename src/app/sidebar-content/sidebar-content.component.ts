import { Component, computed, Input, signal } from '@angular/core';
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
  imports: [MatListModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
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
      label: 'Úvodní Stránka',
      route: 'home',
    },
    {
      icon: 'person',
      label: 'Profil',
      route: 'profile',
    },
    {
      icon: 'text_fields',
      label: 'Slovní Druhy',
      route: 'test',
    },
    {
      icon: 'category',
      label: 'Mluvnické Kategorie',
      route: 'test',
    },
    {
      icon: 'settings',
      label: 'Nastavení',
      route: 'settings',
    },
  ]);

  profilePicSize = computed(() => this.sidebarCollapsed() ? '0' : '60')
}
