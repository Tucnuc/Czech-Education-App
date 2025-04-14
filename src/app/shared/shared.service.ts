import { Injectable, signal } from '@angular/core';

export type databaseItem = {
  id: string;
  mode: string;
  ready: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor() { }

  database = signal<databaseItem[]>([
    {
      id: 'slovniDruhy',
      mode: '',
      ready: false
    },
    {
      id: 'mluvKategorie',
      mode: '',
      ready: false
    }
  ])

  setData(id: string, key: keyof databaseItem, value: string | boolean): void {
    this.database.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      )
    );
  }
  getData(id: string, key: keyof databaseItem): string | boolean | undefined {
    const item = this.database().find((item) => item.id === id);
    return item ? item[key] : undefined;
  }
}
