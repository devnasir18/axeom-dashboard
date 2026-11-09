export interface Booking {
  id: string;
  client: string;
  email: string;
  date: string;
  status: string;
  shootType: string;
  amount: number;
  location: string;
  sourceFile: string;
}

export interface Invoice {
  id: string;
  client: string;
  billTo: string;
  email: string;
  bookingId: string;
  amount: number;
  status: string;
  dueDate: string;
  sentDate: string;
  sourceFile: string;
}

export interface Lead {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  date: string;
  notes: string;
  sourceFile: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  sourceFile: string;
}

export interface ProductionTask {
  id: string;
  client: string;
  bookingId: string;
  task: string;
  status: string;
  dueDate: string;
  assignee: string;
  sourceFile: string;
}

export interface Cost {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  client: string;
  sourceFile: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  availability: string;
  skills: string;
  sourceFile: string;
}

export interface Message {
  id: string;
  client: string;
  text: string;
  date: string;
  direction: string;
  sourceFile: string;
  _email?: string;
  _phone?: string;
  _parenName?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  variants: string[];
  bookings: Booking[];
  invoices: Invoice[];
  messages: Message[];
  productionTasks: ProductionTask[];
  costs: Cost[];
}

export interface ParsedFile {
  fileName: string;
  data: Record<string, string>[];
}

export interface DashboardState {
  bookings: Booking[];
  invoices: Invoice[];
  leads: Lead[];
  payments: Payment[];
  productionTasks: ProductionTask[];
  costs: Cost[];
  team: TeamMember[];
  messages: Message[];
  clients: ClientProfile[];
  loaded: boolean;
  fileCount: number;
}

export const EMPTY_STATE: DashboardState = {
  bookings: [],
  invoices: [],
  leads: [],
  payments: [],
  productionTasks: [],
  costs: [],
  team: [],
  messages: [],
  clients: [],
  loaded: false,
  fileCount: 0,
};
