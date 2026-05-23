import type { Booking, Client, Payment, Income, Expense } from '../electron';

// LocalStorage Helper for fallback browser environment
const LS_KEYS = {
  BOOKINGS: 'media_mirror_bookings',
  CLIENTS: 'media_mirror_clients',
  PAYMENTS: 'media_mirror_payments',
  INCOME: 'media_mirror_income',
  EXPENSES: 'media_mirror_expenses',
};

const getStored = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed mock data for fallback
const seedLocalStorage = () => {
  const clients: Client[] = [
    { id: 'c1', name: 'Johnathan Doe', email: 'johnathan.doe@email.com', phone: '+1 (555) 019-2834', company: 'JD Portrait Design', createdAt: new Date().toISOString() },
    { id: 'c2', name: 'Alice Schmidt', email: 'alice.schmidt@email.com', phone: '+1 (555) 123-4567', company: 'Media Mirror', createdAt: new Date().toISOString() },
    { id: 'c3', name: 'Robert Wilson', email: 'robert.wilson@email.com', phone: '+1 (555) 765-4321', company: 'Wilson Commercials', createdAt: new Date().toISOString() },
    { id: 'c4', name: 'Elena Martinez', email: 'elena.martinez@email.com', phone: '+1 (555) 987-6543', company: 'Family Moments', createdAt: new Date().toISOString() },
    { id: 'c5', name: 'Thomas Kincaid', email: 'thomas.kincaid@email.com', phone: '+1 (555) 234-5678', company: 'Kincaid Events', createdAt: new Date().toISOString() },
  ];

  const bookings: Booking[] = [
    {
      id: 'b1',
      clientId: 'c1',
      client: clients[0],
      eventDate: '2023-11-12',
      serviceType: 'Portrait Shoot',
      location: 'Studio B, First Floor',
      duration: '2 Hours',
      status: 'Confirmed',
      totalAmount: 1250.00,
      payments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'b2',
      clientId: 'c2',
      client: clients[1],
      eventDate: '2023-11-08',
      serviceType: 'Wedding',
      location: 'Studio A, Main Floor',
      duration: '4 Hours',
      status: 'Pending',
      totalAmount: 4800.00,
      payments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'b3',
      clientId: 'c3',
      client: clients[2],
      eventDate: '2023-10-29',
      serviceType: 'Event Shoot',
      location: 'Downtown Outdoor',
      duration: '6 Hours',
      status: 'Completed',
      totalAmount: 2100.00,
      payments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'b4',
      clientId: 'c4',
      client: clients[3],
      eventDate: '2023-10-25',
      serviceType: 'Family Shoot',
      location: 'Local Park',
      duration: '1.5 Hours',
      status: 'Confirmed',
      totalAmount: 450.00,
      payments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'b5',
      clientId: 'c5',
      client: clients[4],
      eventDate: '2023-10-22',
      serviceType: 'Engagement',
      location: 'Grand Hall Ballroom',
      duration: '5 Hours',
      status: 'Completed',
      totalAmount: 3400.00,
      payments: [],
      createdAt: new Date().toISOString()
    }
  ];

  // Dynamic upcoming dates for dashboard list
  const getOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  bookings.push({
    id: 'b6',
    clientId: 'c1',
    client: clients[0],
    eventDate: getOffsetDate(2),
    serviceType: 'Portrait Shoot',
    location: 'Studio A',
    duration: '1 Hour',
    status: 'Confirmed',
    totalAmount: 800.00,
    payments: [],
    createdAt: new Date().toISOString()
  });

  bookings.push({
    id: 'b7',
    clientId: 'c2',
    client: clients[1],
    eventDate: getOffsetDate(4),
    serviceType: 'Wedding',
    location: 'Oceanside Resort',
    duration: '8 Hours',
    status: 'Confirmed',
    totalAmount: 5500.00,
    payments: [],
    createdAt: new Date().toISOString()
  });

  const payments: Payment[] = [
    { id: 'p1', bookingId: 'b1', amount: 1250.00, paymentDate: '2023-10-24', paymentMethod: 'Credit Card', notes: 'Full payment', createdAt: new Date().toISOString() },
    { id: 'p2', bookingId: 'b2', amount: 800.00, paymentDate: '2023-10-22', paymentMethod: 'Bank Transfer', notes: 'Initial deposit', createdAt: new Date().toISOString() },
    { id: 'p3', bookingId: 'b3', amount: 2100.00, paymentDate: '2023-10-20', paymentMethod: 'Cash', notes: 'Completed payment', createdAt: new Date().toISOString() },
    { id: 'p4', bookingId: 'b4', amount: 325.00, paymentDate: '2023-10-18', paymentMethod: 'UPI', notes: 'Partial payment', createdAt: new Date().toISOString() },
    { id: 'p5', bookingId: 'b5', amount: 3400.00, paymentDate: '2023-10-15', paymentMethod: 'Credit Card', notes: 'Full payment', createdAt: new Date().toISOString() }
  ];

  bookings[0].payments = [payments[0]];
  bookings[1].payments = [payments[1]];
  bookings[2].payments = [payments[2]];
  bookings[3].payments = [payments[3]];
  bookings[4].payments = [payments[4]];

  const income: Income[] = [
    { id: 'i1', date: '2023-10-24', source: 'Frame Sales', amount: 350.00, notes: 'Sold 3 wooden frames to Johnathan Doe', createdAt: new Date().toISOString() },
    { id: 'i2', date: '2023-10-15', source: 'Album Printing', amount: 500.00, notes: 'Premium album prints for Thomas Kincaid', createdAt: new Date().toISOString() }
  ];

  const expenses: Expense[] = [
    { id: 'e1', date: '2023-10-22', category: 'Equipment rental', amount: 800.00, notes: 'Lens rental (85mm f/1.2)', createdAt: new Date().toISOString() },
    { id: 'e2', date: '2023-10-15', category: 'Studio Rent', amount: 1500.00, notes: 'Monthly rent for studio premises', createdAt: new Date().toISOString() },
    { id: 'e3', date: '2023-10-10', category: 'Software subscription', amount: 80.00, notes: 'Adobe Creative Cloud membership', createdAt: new Date().toISOString() }
  ];

  setStored(LS_KEYS.CLIENTS, clients);
  setStored(LS_KEYS.BOOKINGS, bookings);
  setStored(LS_KEYS.PAYMENTS, payments);
  setStored(LS_KEYS.INCOME, income);
  setStored(LS_KEYS.EXPENSES, expenses);
};

// If local storage is empty, seed it
if (!localStorage.getItem(LS_KEYS.CLIENTS)) {
  seedLocalStorage();
}

// Fallback implementation of WindowApi using LocalStorage
const fallbackApi: any = {
  getClients: async () => getStored<Client[]>(LS_KEYS.CLIENTS, []),
  createClient: async (clientData: any) => {
    const clients = getStored<Client[]>(LS_KEYS.CLIENTS, []);
    const newClient: Client = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      name: clientData.name,
      email: clientData.email || null,
      phone: clientData.phone || null,
      company: clientData.company || null,
      createdAt: new Date().toISOString(),
    };
    clients.push(newClient);
    setStored(LS_KEYS.CLIENTS, clients);
    return newClient;
  },

  getBookings: async () => {
    const bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const clients = getStored<Client[]>(LS_KEYS.CLIENTS, []);
    const payments = getStored<Payment[]>(LS_KEYS.PAYMENTS, []);

    // Re-link references for accuracy
    return bookings.map(b => ({
      ...b,
      client: clients.find(c => c.id === b.clientId) || b.client,
      payments: payments.filter(p => p.bookingId === b.id)
    }));
  },

  getBookingById: async (id: string) => {
    const bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const clients = getStored<Client[]>(LS_KEYS.CLIENTS, []);
    const payments = getStored<Payment[]>(LS_KEYS.PAYMENTS, []);
    const b = bookings.find(item => item.id === id);
    if (!b) throw new Error('Booking not found');
    return {
      ...b,
      client: clients.find(c => c.id === b.clientId) || b.client,
      payments: payments.filter(p => p.bookingId === b.id)
    };
  },

  createBooking: async (bookingData: any) => {
    const bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const clients = getStored<Client[]>(LS_KEYS.CLIENTS, []);

    let resolvedClientId = bookingData.clientId;
    if (!resolvedClientId && bookingData.clientName) {
      let client = clients.find(c => c.name === bookingData.clientName);
      if (!client) {
        client = {
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          name: bookingData.clientName,
          email: bookingData.clientEmail || null,
          phone: bookingData.clientPhone || null,
          company: bookingData.clientCompany || null,
          createdAt: new Date().toISOString(),
        };
        clients.push(client);
        setStored(LS_KEYS.CLIENTS, clients);
      }
      resolvedClientId = client.id;
    }

    const client = clients.find(c => c.id === resolvedClientId)!;
    const newBooking: Booking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      clientId: resolvedClientId,
      client,
      eventDate: bookingData.eventDate,
      serviceType: bookingData.serviceType,
      location: bookingData.location || null,
      duration: bookingData.duration || null,
      status: bookingData.status || 'Pending',
      totalAmount: parseFloat(bookingData.totalAmount) || 0,
      payments: [],
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    setStored(LS_KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  updateBooking: async (id: string, bookingData: any) => {
    const bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    
    bookings[idx] = {
      ...bookings[idx],
      eventDate: bookingData.eventDate ?? bookings[idx].eventDate,
      serviceType: bookingData.serviceType ?? bookings[idx].serviceType,
      location: bookingData.location ?? bookings[idx].location,
      duration: bookingData.duration ?? bookings[idx].duration,
      status: bookingData.status ?? bookings[idx].status,
      totalAmount: bookingData.totalAmount !== undefined ? parseFloat(bookingData.totalAmount) : bookings[idx].totalAmount,
    };
    
    setStored(LS_KEYS.BOOKINGS, bookings);
    return bookings[idx];
  },

  deleteBooking: async (id: string) => {
    let bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const b = bookings.find(item => item.id === id);
    bookings = bookings.filter(item => item.id !== id);
    setStored(LS_KEYS.BOOKINGS, bookings);
    return b!;
  },

  getPayments: async () => {
    const payments = getStored<Payment[]>(LS_KEYS.PAYMENTS, []);
    const bookings = getStored<Booking[]>(LS_KEYS.BOOKINGS, []);
    const clients = getStored<Client[]>(LS_KEYS.CLIENTS, []);

    return payments.map(p => {
      const b = bookings.find(item => item.id === p.bookingId);
      return {
        ...p,
        booking: b ? {
          ...b,
          client: clients.find(c => c.id === b.clientId)!
        } : undefined
      };
    });
  },

  createPayment: async (paymentData: any) => {
    const payments = getStored<Payment[]>(LS_KEYS.PAYMENTS, []);
    const newPayment: Payment = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      bookingId: paymentData.bookingId,
      amount: parseFloat(paymentData.amount) || 0,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes || null,
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    setStored(LS_KEYS.PAYMENTS, payments);
    return newPayment;
  },

  getIncome: async () => getStored<Income[]>(LS_KEYS.INCOME, []),
  createIncome: async (incomeData: any) => {
    const incomes = getStored<Income[]>(LS_KEYS.INCOME, []);
    const newIncome: Income = {
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      date: incomeData.date,
      source: incomeData.source,
      amount: parseFloat(incomeData.amount) || 0,
      notes: incomeData.notes || null,
      createdAt: new Date().toISOString()
    };
    incomes.push(newIncome);
    setStored(LS_KEYS.INCOME, incomes);
    return newIncome;
  },
  deleteIncome: async (id: string) => {
    let incomes = getStored<Income[]>(LS_KEYS.INCOME, []);
    const i = incomes.find(item => item.id === id);
    incomes = incomes.filter(item => item.id !== id);
    setStored(LS_KEYS.INCOME, incomes);
    return i!;
  },

  getExpenses: async () => getStored<Expense[]>(LS_KEYS.EXPENSES, []),
  createExpense: async (expenseData: any) => {
    const expenses = getStored<Expense[]>(LS_KEYS.EXPENSES, []);
    const newExpense: Expense = {
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      date: expenseData.date,
      category: expenseData.category,
      amount: parseFloat(expenseData.amount) || 0,
      notes: expenseData.notes || null,
      createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    setStored(LS_KEYS.EXPENSES, expenses);
    return newExpense;
  },
  deleteExpense: async (id: string) => {
    let expenses = getStored<Expense[]>(LS_KEYS.EXPENSES, []);
    const e = expenses.find(item => item.id === id);
    expenses = expenses.filter(item => item.id !== id);
    setStored(LS_KEYS.EXPENSES, expenses);
    return e!;
  },

  seedDatabase: async () => {
    seedLocalStorage();
    return { success: true };
  },

  getAppVersion: async () => '1.0.0 (Browser Demo Mode)'
};

// Export the active DB Bridge: uses Electron if present, else fallback localStorage
export const dbService = (typeof window !== 'undefined' && window.api) 
  ? window.api 
  : fallbackApi;
