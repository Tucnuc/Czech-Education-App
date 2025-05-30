import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './page-components/profile/profile.component';
import { SlovniDruhyComponent } from './page-components/slovni-druhy/slovni-druhy.component';
import { KategorieComponent } from './page-components/kategorie/kategorie.component';
import { LeaderboardComponent } from './page-components/leaderboard/leaderboard.component';
import { FriendsComponent } from './page-components/friends/friends.component';
import { AccountComponent } from './page-components/account/account.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'friends', component: FriendsComponent },
    { path: 'slovni-druhy', component: SlovniDruhyComponent },
    { path: 'kategorie', component: KategorieComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: 'account', component: AccountComponent },
];