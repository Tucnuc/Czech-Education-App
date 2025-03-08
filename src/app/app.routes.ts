import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { SettingsComponent } from './page-components/settings/settings.component';
import { ProfileComponent } from './page-components/profile/profile.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'test', component: TestComponent },
    { path: 'settings', component: SettingsComponent },
];