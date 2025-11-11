// src/app/core/models/menu.model.ts

// src/app/core/models/menu.model.ts

export interface Menu {
  icon?: string;
  title: string;
  orden?: number;
  grupo?: string;
  link?: string;
  children?: Menu[];
}
