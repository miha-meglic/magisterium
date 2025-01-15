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
export interface Classroom {
  id: int,
  name: string
}

export interface TimetableEntry {
  classroomId: string,
  classroomName: string,
  start: string,
  end: string
}