const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Bookings
  getBookings: () => ipcRenderer.invoke('db:bookings:get'),
  getBookingById: (id) => ipcRenderer.invoke('db:bookings:getById', id),
  createBooking: (booking) => ipcRenderer.invoke('db:bookings:create', booking),
  updateBooking: (id, booking) => ipcRenderer.invoke('db:bookings:update', id, booking),
  deleteBooking: (id) => ipcRenderer.invoke('db:bookings:delete', id),

  // Clients
  getClients: () => ipcRenderer.invoke('db:clients:get'),
  createClient: (client) => ipcRenderer.invoke('db:clients:create', client),

  // Payments
  getPayments: () => ipcRenderer.invoke('db:payments:get'),
  createPayment: (payment) => ipcRenderer.invoke('db:payments:create', payment),

  // Income
  getIncome: () => ipcRenderer.invoke('db:income:get'),
  createIncome: (income) => ipcRenderer.invoke('db:income:create', income),
  deleteIncome: (id) => ipcRenderer.invoke('db:income:delete', id),

  // Expenses
  getExpenses: () => ipcRenderer.invoke('db:expenses:get'),
  createExpense: (expense) => ipcRenderer.invoke('db:expenses:create', expense),
  deleteExpense: (id) => ipcRenderer.invoke('db:expenses:delete', id),

  // Database seed control
  seedDatabase: () => ipcRenderer.invoke('db:seed'),
  
  // App information
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});
