import { Injectable, PLATFORM_ID, Inject, signal, computed, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Account {
  username: string;
  profilePicture: string;
  darkmode: boolean;
  friends: string[];
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
    friends: [],
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
  readonly friends = computed(() => this.accountInfoSignal().friends);
  readonly loggedIn = computed(() => this.accountInfoSignal().loggedIn);
  
  // Signal pro celý objekt účtu
  readonly accountInfo: Signal<Account> = this.accountInfoSignal.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadStoredAccount();
    }
  }

  /**
   * Nastaví informace o účtu a volitelně je uloží do localStorage
   * @param account Informace o účtu k nastavení
   * @param storeLocally Zda ukládat do localStorage (výchozí: true)
   */
  setAccountInfo(account: Account, storeLocally: boolean = true): void {
    this.accountInfoSignal.set({ ...account });
    
    if (storeLocally && this.isBrowser) {
      localStorage.setItem('accountInfo', JSON.stringify(account));
    }
  }

  /**
   * Aktualizuje pouze některé vlastnosti účtu
   * @param partialAccount Částečné informace o účtu k aktualizaci
   * @param storeLocally Zda ukládat do localStorage (výchozí: true)
   */
  updateAccountInfo(partialAccount: Partial<Account>, storeLocally: boolean = true): void {
    this.accountInfoSignal.update(currentAccount => ({
      ...currentAccount,
      ...partialAccount
    }));
    
    if (storeLocally && this.isBrowser) {
      localStorage.setItem('accountInfo', JSON.stringify(this.accountInfoSignal()));
    }
  }

  /**
   * Odhlásí uživatele a resetuje informace o účtu na výchozí hodnoty
   */
  logoutUser(): void {
    this.accountInfoSignal.set({ ...this.defaultAccountInfo });
    
    if (this.isBrowser) {
      localStorage.removeItem('accountInfo');
      window.location.reload();
    }
  }

  /**
   * Načte uložené informace o účtu z localStorage, pokud existují
   */
  private loadStoredAccount(): void {
    if (this.isBrowser) {
      const storedAccount = localStorage.getItem('accountInfo');
      if (storedAccount) {
        try {
          const parsedAccount = JSON.parse(storedAccount);
          this.accountInfoSignal.set(parsedAccount);
        } catch (error) {
          console.error('Chyba při načítání účtu z localStorage:', error);
        }
      }
    }
  }
}