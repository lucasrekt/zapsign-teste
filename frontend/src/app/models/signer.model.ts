export class Signer {
    id!: number;
    token!: string;
    status!: string;
    name!: string;
    email!: string;
    externalID?: string;
    documentID!: number;
  
    constructor(init?: Partial<Signer>) {
      Object.assign(this, init);
    }
  }
  