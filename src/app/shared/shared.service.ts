import { Injectable, PLATFORM_ID, Inject, signal, computed, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Account {
  username: string;
  profilePicture: string;
  darkmode: boolean;
  requests: string[];
  level: number;
  xp: number;
  loggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private isBrowser: boolean;

  // Výchozí hodnoty účtu
  private defaultAccountInfo: Account = {
    username: 'Guest',
    profilePicture: 'images/default.png',
    darkmode: false,
    requests: [],
    level: 0,
    xp: 0,
    loggedIn: false,
  };

  // Signal pro accountInfo
  private accountInfoSignal = signal<Account>({ ...this.defaultAccountInfo });
  
  // Computed signály pro jednotlivé vlastnosti (pro snadný přístup)
  readonly username = computed(() => this.accountInfoSignal().username);
  readonly profilePicture = computed(() => this.accountInfoSignal().profilePicture);
  readonly darkmode = computed(() => this.accountInfoSignal().darkmode);
  readonly level = computed(() => this.accountInfoSignal().level);
  readonly xp = computed(() => this.accountInfoSignal().xp);
  readonly requests = computed(() => this.accountInfoSignal().requests);
  readonly loggedIn = computed(() => this.accountInfoSignal().loggedIn);
  
  // Signal pro celý objekt účtu
  readonly accountInfo: Signal<Account> = this.accountInfoSignal.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadStoredUsername();
    }
  }

  /**
   * Nastaví informace o účtu a uloží pouze username do localStorage
   * @param account Informace o účtu k nastavení
   */
  setAccountInfo(account: Account): void {
    this.accountInfoSignal.set({ ...account });
    
    if (this.isBrowser) {
      localStorage.setItem('username', account.username);
    }
  }

  /**
   * Aktualizuje pouze některé vlastnosti účtu
   * @param partialAccount Částečné informace o účtu k aktualizaci
   */
  updateAccountInfo(partialAccount: Partial<Account>): void {
    this.accountInfoSignal.update(currentAccount => ({
      ...currentAccount,
      ...partialAccount
    }));
    
    // Pouze pokud se aktualizuje username, ulož ho do localStorage
    if (this.isBrowser && partialAccount.username) {
      localStorage.setItem('username', partialAccount.username);
    }
  }

  /**
   * Odhlásí uživatele a resetuje informace o účtu na výchozí hodnoty
   */
  logoutUser(): void {
    this.accountInfoSignal.set({ ...this.defaultAccountInfo });
    
    if (this.isBrowser) {
      localStorage.removeItem('username');
      window.location.reload();
    }
  }

  /**
   * Načte username z localStorage a načte data uživatele z API
   */
  private async loadStoredUsername(): Promise<void> {
    if (this.isBrowser) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        try {
          // Nastav nejprve username a přihlášení
          this.accountInfoSignal.update(current => ({
            ...current,
            username: storedUsername,
            loggedIn: true
          }));
          
          // Potom načti zbytek dat z API
          await this.fetchUserData(storedUsername);
        } catch (error) {
          console.error('Chyba při načítání uživatelských dat:', error);
        }
      }
    }
  }

  /**
   * Získá data uživatele z API podle username
   */
  async fetchUserData(username: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:8000/profile/get-user-data/${username}`);
      const data = await response.json();
      
      this.accountInfoSignal.update(current => ({
        ...current,
        profilePicture: data.profile_picture,
        darkmode: data.darkmode,
        requests: data.friends_requests,
        level: data.level,
        xp: data.xp,
        loggedIn: true
      }));
    } catch (err) {
      console.error('Chyba při načítání dat uživatele:', err);
    }
  }
}