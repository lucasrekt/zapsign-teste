import { Signer } from "./signer.model";

export class Document {
    id!: number;
    openID!: number;
    token!: string;
    name!: string;
    status!: string;
    createdAt!: Date;
    lastUpdatedAt!: Date;
    companyID!: number;
    externalID?: string;
    signers!: Signer[];
  
    constructor(init?: Partial<Document>) {
      Object.assign(this, init);
    }
  }
  