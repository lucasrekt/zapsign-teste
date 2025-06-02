export class Company {
    id!: number;
    name!: string;
    createdAt!: Date;
    lastUpdateAt!: Date;
    apiToken!: string;
  
    constructor(init?: Partial<Company>) {
      Object.assign(this, init);
    }
  }
  