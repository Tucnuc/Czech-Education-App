import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarContentComponent } from './sidebar-content/sidebar-content.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule,
    SidebarContentComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cestina';
}
