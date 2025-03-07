import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-content',
  imports: [MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {

  profileName: string = 'Guest';
  loggedIn: boolean = false;
  profilePicture: string = 'images/default.png';
  profileRank: number = 0;

  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Úvodní Stránka',
      route: '',
    },
    {
      icon: 'person',
      label: 'Profil',
      route: '',
    },
    {
      icon: 'text_fields',
      label: 'Slovní Druhy',
      route: '',
    },
    {
      icon: 'category',
      label: 'Mluvnické Kategorie',
      route: '',
    },
    {
      icon: 'settings',
      label: 'Nastavení',
      route: '',
    },
  ]);

}
