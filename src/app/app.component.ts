import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarContentComponent } from './sidebar-content/sidebar-content.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule,
    SidebarContentComponent, NgStyle
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('fading', [
      state('collapsed', style({ display: 'none', opacity: 0 })),
      state('expanded', style({ display: 'block', opacity: 1 })),
      transition('collapsed => expanded', [animate('500ms ease-in-out')]),
    ]),
  ]
})
export class AppComponent {
  title = 'cestina';

  collapsed = signal(false);

  sidebarWidth = computed(() => this.collapsed() ? '65px' : '275px')
}
