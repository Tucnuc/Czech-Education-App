import { Component, computed, Inject, OnInit, signal, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { SidebarContentComponent } from './sidebar-content/sidebar-content.component';
import { NgIf, NgStyle, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule,
    SidebarContentComponent, NgStyle, NgIf
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
export class AppComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  @ViewChild('sidenav') sidenav!: MatSidenav;
  sidenavOpened = false;

  title = 'cestina';

  collapsed = signal(false);
  mode: boolean = false;
  state: boolean = false;

  sidebarWidth = computed(() => this.collapsed() ? '65px' : '275px')
  sidebarWidthSmall = computed(() => this.collapsed() ? '0px' : '275px')

  displayVariable: boolean = true;
  secondSomething() {
    this.sidenav.toggle();
    this.displayVariable = false;
    setTimeout(() => {
      this.displayVariable = true;
    }, 1000);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const screenWidth = window.innerWidth;
      if (screenWidth < 950) {
        this.mode = true;
      } else if (screenWidth < 1200) {
        this.collapsed.set(true);
      }
    }
  }
}
