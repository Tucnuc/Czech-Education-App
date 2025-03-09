import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cestina';

  collapsed = signal(false);

  sidebarWidth = computed(() => this.collapsed() ? '65px' : '275px')
}
