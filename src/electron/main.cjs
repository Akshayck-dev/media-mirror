const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

let mainWindow;
let prisma;

// Determine paths
const isDev = !app.isPackaged;
const appDataDir = app.getPath('userData');
const dbPath = isDev 
  ? path.join(__dirname, '../../prisma/dev.db')
  : path.join(appDataDir, 'media_mirror.db');

// Ensure database URL env variable is set
process.env.DATABASE_URL = `file:${dbPath}`;

// Ensure database file and directories exist
const dbDirectory = path.dirname(dbPath);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

if (!isDev) {
  // If DB doesn't exist, we will copy a template DB if available,
  // or let Prisma create it. In production, we bundle a clean template DB in the app resources.
  const templateDbPath = path.join(process.resourcesPath, 'app/prisma/dev.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(templateDbPath)) {
    try {
      fs.copyFileSync(templateDbPath, dbPath);
      console.log('SQLite database initialized from packaged template.');
    } catch (e) {
      console.error('Failed to copy template database:', e);
    }
  }
}

// Initialize Prisma
prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

async function runInitialSchemaCheck() {
  try {
    // Basic test query to verify table schema
    await prisma.client.count();
  } catch (error) {
    console.log('Database tables might be missing. Running migrations/schema push...', error.message);
    if (isDev) {
      const { execSync } = require('child_process');
      try {
        const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
        execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, { stdio: 'inherit' });
        console.log('Database schema pushed successfully in dev.');
      } catch (err) {
        console.error('Failed to push prisma schema in dev:', err);
      }
    } else {
      console.error('Database tables are missing in production. Template copy might have failed.');
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Media Mirror - Premium Studio Management',
    backgroundColor: '#F9FAFB',
  });

  // Remove menu bar for a cleaner desktop feel
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  await runInitialSchemaCheck();
  
  // Auto-seed if database is empty on first-time launch
  try {
    const clientCount = await prisma.client.count();
    if (clientCount === 0) {
      console.log('SQLite database is empty. Auto-seeding mock studio data...');
      await seedDatabaseInternal();
    }
  } catch (err) {
    console.error('Failed to auto-seed SQLite database on startup:', err);
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up Prisma on exit
app.on('will-quit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// IPC Handler Registrations
// 1. Clients
ipcMain.handle('db:clients:get', async () => {
  return await prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { bookings: true }
  });
});

ipcMain.handle('db:clients:create', async (event, clientData) => {
  return await prisma.client.create({
    data: clientData
  });
});

// 2. Bookings
ipcMain.handle('db:bookings:get', async () => {
  return await prisma.booking.findMany({
    include: {
      client: true,
      payments: true
    },
    orderBy: { eventDate: 'desc' }
  });
});

ipcMain.handle('db:bookings:getById', async (event, id) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      client: true,
      payments: true
    }
  });
});

ipcMain.handle('db:bookings:create', async (event, bookingData) => {
  const { clientId, clientName, clientEmail, clientPhone, clientCompany, ...bookingFields } = bookingData;
  
  let resolvedClientId = clientId;

  if (!resolvedClientId && clientName) {
    let client = await prisma.client.findFirst({
      where: { name: clientName }
    });
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          company: clientCompany
        }
      });
    }
    resolvedClientId = client.id;
  }

  return await prisma.booking.create({
    data: {
      ...bookingFields,
      clientId: resolvedClientId
    },
    include: {
      client: true,
      payments: true
    }
  });
});

ipcMain.handle('db:bookings:update', async (event, id, bookingData) => {
  const { client, payments, ...fields } = bookingData;
  return await prisma.booking.update({
    where: { id },
    data: fields,
    include: {
      client: true,
      payments: true
    }
  });
});

ipcMain.handle('db:bookings:delete', async (event, id) => {
  return await prisma.booking.delete({
    where: { id }
  });
});

// 3. Payments
ipcMain.handle('db:payments:get', async () => {
  return await prisma.payment.findMany({
    include: {
      booking: {
        include: { client: true }
      }
    },
    orderBy: { paymentDate: 'desc' }
  });
});

ipcMain.handle('db:payments:create', async (event, paymentData) => {
  return await prisma.payment.create({
    data: paymentData,
    include: {
      booking: {
        include: { client: true }
      }
    }
  });
});

// 4. Income
ipcMain.handle('db:income:get', async () => {
  return await prisma.income.findMany({
    orderBy: { date: 'desc' }
  });
});

ipcMain.handle('db:income:create', async (event, incomeData) => {
  return await prisma.income.create({
    data: incomeData
  });
});

ipcMain.handle('db:income:delete', async (event, id) => {
  return await prisma.income.delete({
    where: { id }
  });
});

// 5. Expenses
ipcMain.handle('db:expenses:get', async () => {
  return await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });
});

ipcMain.handle('db:expenses:create', async (event, expenseData) => {
  return await prisma.expense.create({
    data: expenseData
  });
});

ipcMain.handle('db:expenses:delete', async (event, id) => {
  return await prisma.expense.delete({
    where: { id }
  });
});

// Seeding database utility helper
async function seedDatabaseInternal() {
  // Clear database first
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.income.deleteMany({});
  await prisma.expense.deleteMany({});

  // Seed Clients
  const jd = await prisma.client.create({
    data: { name: 'Johnathan Doe', email: 'johnathan.doe@email.com', phone: '+1 (555) 019-2834', company: 'JD Portrait Design' }
  });
  const as = await prisma.client.create({
    data: { name: 'Alice Schmidt', email: 'alice.schmidt@email.com', phone: '+1 (555) 123-4567', company: 'Media Mirror' }
  });
  const rw = await prisma.client.create({
    data: { name: 'Robert Wilson', email: 'robert.wilson@email.com', phone: '+1 (555) 765-4321', company: 'Wilson Commercials' }
  });
  const em = await prisma.client.create({
    data: { name: 'Elena Martinez', email: 'elena.martinez@email.com', phone: '+1 (555) 987-6543', company: 'Family Moments' }
  });
  const tk = await prisma.client.create({
    data: { name: 'Thomas Kincaid', email: 'thomas.kincaid@email.com', phone: '+1 (555) 234-5678', company: 'Kincaid Events' }
  });

  // Seed Bookings
  const b1 = await prisma.booking.create({
    data: {
      clientId: jd.id,
      eventDate: '2023-11-12',
      serviceType: 'Portrait Shoot',
      location: 'Studio B, First Floor',
      duration: '2 Hours',
      status: 'Confirmed',
      totalAmount: 1250.00
    }
  });

  const b2 = await prisma.booking.create({
    data: {
      clientId: as.id,
      eventDate: '2023-11-08',
      serviceType: 'Wedding',
      location: 'Studio A, Main Floor',
      duration: '4 Hours',
      status: 'Pending',
      totalAmount: 4800.00
    }
  });

  const b3 = await prisma.booking.create({
    data: {
      clientId: rw.id,
      eventDate: '2023-10-29',
      serviceType: 'Event Shoot',
      location: 'Downtown Outdoor',
      duration: '6 Hours',
      status: 'Completed',
      totalAmount: 2100.00
    }
  });

  const b4 = await prisma.booking.create({
    data: {
      clientId: em.id,
      eventDate: '2023-10-25',
      serviceType: 'Family Shoot',
      location: 'Local Park',
      duration: '1.5 Hours',
      status: 'Confirmed',
      totalAmount: 450.00
    }
  });

  const b5 = await prisma.booking.create({
    data: {
      clientId: tk.id,
      eventDate: '2023-10-22',
      serviceType: 'Engagement',
      location: 'Grand Hall Ballroom',
      duration: '5 Hours',
      status: 'Completed',
      totalAmount: 3400.00
    }
  });

  const today = new Date();
  const dateStr = (days) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  await prisma.booking.create({
    data: {
      clientId: jd.id,
      eventDate: dateStr(2),
      serviceType: 'Portrait Shoot',
      location: 'Studio A',
      duration: '1 Hour',
      status: 'Confirmed',
      totalAmount: 800.00
    }
  });

  await prisma.booking.create({
    data: {
      clientId: as.id,
      eventDate: dateStr(4),
      serviceType: 'Wedding',
      location: 'Oceanside Resort',
      duration: '8 Hours',
      status: 'Confirmed',
      totalAmount: 5500.00
    }
  });

  // Seed Payments
  await prisma.payment.create({
    data: { bookingId: b1.id, amount: 1250.00, paymentDate: '2023-10-24', paymentMethod: 'Credit Card', notes: 'Full payment' }
  });
  await prisma.payment.create({
    data: { bookingId: b2.id, amount: 800.00, paymentDate: '2023-10-22', paymentMethod: 'Bank Transfer', notes: 'Initial deposit' }
  });
  await prisma.payment.create({
    data: { bookingId: b3.id, amount: 2100.00, paymentDate: '2023-10-20', paymentMethod: 'Cash', notes: 'Completed payment' }
  });
  await prisma.payment.create({
    data: { bookingId: b4.id, amount: 325.00, paymentDate: '2023-10-18', paymentMethod: 'UPI', notes: 'Partial payment' }
  });
  await prisma.payment.create({
    data: { bookingId: b5.id, amount: 3400.00, paymentDate: '2023-10-15', paymentMethod: 'Credit Card', notes: 'Full payment' }
  });

  // Seed extra Income
  await prisma.income.create({
    data: { date: '2023-10-24', source: 'Frame Sales', amount: 350.00, notes: 'Sold 3 wooden frames to Johnathan Doe' }
  });
  await prisma.income.create({
    data: { date: '2023-10-15', source: 'Album Printing', amount: 500.00, notes: 'Premium album prints for Thomas Kincaid' }
  });

  // Seed Expenses
  await prisma.expense.create({
    data: { date: '2023-10-22', category: 'Equipment rental', amount: 800.00, notes: 'Lens rental (85mm f/1.2)' }
  });
  await prisma.expense.create({
    data: { date: '2023-10-15', category: 'Studio Rent', amount: 1500.00, notes: 'Monthly rent for studio premises' }
  });
  await prisma.expense.create({
    data: { date: '2023-10-10', category: 'Software subscription', amount: 80.00, notes: 'Adobe Creative Cloud membership' }
  });
}

// Seed Handler
ipcMain.handle('db:seed', async () => {
  await seedDatabaseInternal();
  return { success: true };
});

ipcMain.handle('app:version', () => {
  return app.getVersion();
});
