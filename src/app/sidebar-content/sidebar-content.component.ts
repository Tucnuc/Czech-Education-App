import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-content',
  imports: [MatListModule, MatIconModule],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {

  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Úvodní Stránka',
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
      icon: 'leaderboard',
      label: 'Statistiky',
      route: '',
    },
    {
      icon: 'settings',
      label: 'Nastavení',
      route: '',
    },
  ]);

}
