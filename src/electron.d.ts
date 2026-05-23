export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  client: Client;
  eventDate: string; // YYYY-MM-DD
  serviceType: string;
  location: string | null;
  duration: string | null;
  status: 'Pending' | 'Confirmed' | 'Completed';
  totalAmount: number;
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking & { client: Client };
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Apple Pay';
  notes: string | null;
  createdAt: string;
}

export interface Income {
  id: string;
  date: string;
  source: string;
  amount: number;
  notes: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string | null;
  createdAt: string;
}

export interface WindowApi {
  // Bookings
  getBookings: () => Promise<Booking[]>;
  getBookingById: (id: string) => Promise<Booking>;
  createBooking: (booking: any) => Promise<Booking>;
  updateBooking: (id: string, booking: any) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<Booking>;

  // Clients
  getClients: () => Promise<Client[]>;
  createClient: (client: any) => Promise<Client>;

  // Payments
  getPayments: () => Promise<Payment[]>;
  createPayment: (payment: any) => Promise<Payment>;

  // Income
  getIncome: () => Promise<Income[]>;
  createIncome: (income: any) => Promise<Income>;
  deleteIncome: (id: string) => Promise<Income>;

  // Expenses
  getExpenses: () => Promise<Expense[]>;
  createExpense: (expense: any) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<Expense>;

  // DB Seed
  seedDatabase: () => Promise<{ success: boolean }>;

  // App version
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    api: WindowApi;
  }
}
