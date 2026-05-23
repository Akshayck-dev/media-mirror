import { create } from 'zustand';
import { dbService } from '../services/dbService';
import type { Booking, Client, Payment, Income, Expense } from '../electron';

interface StudioState {
  bookings: Booking[];
  payments: Payment[];
  income: Income[];
  expenses: Expense[];
  clients: Client[];
  loading: boolean;
  appVersion: string;
  
  // Actions
  fetchBookings: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchIncome: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  
  // CRUD Actions
  createBooking: (bookingData: any) => Promise<void>;
  updateBooking: (id: string, bookingData: any) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  
  createPayment: (paymentData: any) => Promise<void>;
  
  createIncome: (incomeData: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  
  createExpense: (expenseData: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  seedDatabase: () => Promise<void>;
  fetchAppVersion: () => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  bookings: [],
  payments: [],
  income: [],
  expenses: [],
  clients: [],
  loading: false,
  appVersion: '1.0.0',

  fetchBookings: async () => {
    try {
      const data = await dbService.getBookings();
      set({ bookings: data });
    } catch (e) {
      console.error('Error fetching bookings', e);
    }
  },

  fetchPayments: async () => {
    try {
      const data = await dbService.getPayments();
      set({ payments: data });
    } catch (e) {
      console.error('Error fetching payments', e);
    }
  },

  fetchIncome: async () => {
    try {
      const data = await dbService.getIncome();
      set({ income: data });
    } catch (e) {
      console.error('Error fetching income', e);
    }
  },

  fetchExpenses: async () => {
    try {
      const data = await dbService.getExpenses();
      set({ expenses: data });
    } catch (e) {
      console.error('Error fetching expenses', e);
    }
  },

  fetchClients: async () => {
    try {
      const data = await dbService.getClients();
      set({ clients: data });
    } catch (e) {
      console.error('Error fetching clients', e);
    }
  },

  fetchAppVersion: async () => {
    try {
      const version = await dbService.getAppVersion();
      set({ appVersion: version });
    } catch (e) {
      console.error('Error fetching app version', e);
    }
  },

  fetchAllData: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchBookings(),
        get().fetchPayments(),
        get().fetchIncome(),
        get().fetchExpenses(),
        get().fetchClients(),
        get().fetchAppVersion(),
      ]);
    } catch (e) {
      console.error('Error fetching all data', e);
    } finally {
      set({ loading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true });
    try {
      await dbService.createBooking(bookingData);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error creating booking', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateBooking: async (id, bookingData) => {
    set({ loading: true });
    try {
      await dbService.updateBooking(id, bookingData);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error updating booking', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true });
    try {
      await dbService.deleteBooking(id);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error deleting booking', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createPayment: async (paymentData) => {
    set({ loading: true });
    try {
      await dbService.createPayment(paymentData);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error creating payment', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createIncome: async (incomeData) => {
    set({ loading: true });
    try {
      await dbService.createIncome(incomeData);
      await get().fetchAllData(); // Fetch everything to keep summary cards aligned
    } catch (e) {
      console.error('Error creating income', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteIncome: async (id) => {
    set({ loading: true });
    try {
      await dbService.deleteIncome(id);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error deleting income', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  createExpense: async (expenseData) => {
    set({ loading: true });
    try {
      await dbService.createExpense(expenseData);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error creating expense', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true });
    try {
      await dbService.deleteExpense(id);
      await get().fetchAllData();
    } catch (e) {
      console.error('Error deleting expense', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  seedDatabase: async () => {
    set({ loading: true });
    try {
      await dbService.seedDatabase();
      await get().fetchAllData();
    } catch (e) {
      console.error('Error seeding database', e);
      throw e;
    } finally {
      set({ loading: false });
    }
  }
}));
export default useStudioStore;
