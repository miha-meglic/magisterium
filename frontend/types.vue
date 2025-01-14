export interface User {
    id: string;
    name: string;
    email?: string;
}

export interface Tenant {
    id: string;
    name: string;
}

export interface Message {
  id: int,
  sender: string,
  recipient: string,
  content: string,
  createdAt: string
}
