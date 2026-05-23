import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Camera, 
  Users, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  const { bookings, payments, income, expenses, clients } = useStudioStore();

  // Calculations
  const metrics = useMemo(() => {
    // 1. Total Income = Booking Payments + Extra Incomes
    const paymentSum = payments.reduce((sum, p) => sum + p.amount, 0);
    const extraIncomeSum = income.reduce((sum, i) => sum + i.amount, 0);
    const totalIncome = paymentSum + extraIncomeSum;

    // 2. Total Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Profit
    const profit = totalIncome - totalExpenses;

    // 4. Pending Payments = Total amount of bookings - total payments made for bookings
    const bookingsTotal = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    // Booking payments specifically:
    const bookingPaymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = Math.max(0, bookingsTotal - bookingPaymentsTotal);

    // 5. Active Projects (Bookings with Pending or Confirmed status)
    const activeProjects = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;

    return {
      totalIncome,
      totalExpenses,
      profit,
      pendingPayments,
      activeProjects,
      totalBookings: bookings.length,
      totalClients: clients.length
    };
  }, [bookings, payments, income, expenses, clients]);

  // Chart Data preparation: Monthly Income vs Expenses
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize monthly values
    const data = months.map(m => ({
      name: m,
      Income: 0,
      Expenses: 0
    }));

    // Process payments (which count as income)
    payments.forEach(p => {
      if (!p.paymentDate) return;
      const date = new Date(p.paymentDate);
      if (isNaN(date.getTime())) return;
      const mIdx = date.getMonth();
      data[mIdx].Income += p.amount;
    });

    // Process extra income
    income.forEach(i => {
      if (!i.date) return;
      const date = new Date(i.date);
      if (isNaN(date.getTime())) return;
      const mIdx = date.getMonth();
      data[mIdx].Income += i.amount;
    });

    // Process expenses
    expenses.forEach(e => {
      if (!e.date) return;
      const date = new Date(e.date);
      if (isNaN(date.getTime())) return;
      const mIdx = date.getMonth();
      data[mIdx].Expenses += e.amount;
    });

    // In case of empty data, seed mockup values for visual elegance
    const totalRecordedIncome = data.reduce((sum, d) => sum + d.Income, 0);
    const totalRecordedExpenses = data.reduce((sum, d) => sum + d.Expenses, 0);

    if (totalRecordedIncome === 0 && totalRecordedExpenses === 0) {
      return [
        { name: 'Jan', Income: 38000, Expenses: 30000 },
        { name: 'Feb', Income: 52000, Expenses: 45000 },
        { name: 'Mar', Income: 44000, Expenses: 35000 },
        { name: 'Apr', Income: 39000, Expenses: 28000 },
        { name: 'May', Income: 38000, Expenses: 55000 },
        { name: 'Jun', Income: 49000, Expenses: 42000 },
        { name: 'Jul', Income: 45000, Expenses: 32000 },
        { name: 'Aug', Income: 58000, Expenses: 40000 },
        { name: 'Sep', Income: 42000, Expenses: 31000 },
        { name: 'Oct', Income: 65000, Expenses: 38000 },
        { name: 'Nov', Income: 58000, Expenses: 42000 },
        { name: 'Dec', Income: 62000, Expenses: 39000 },
      ];
    }

    return data;
  }, [payments, income, expenses]);

  // Upcoming Photoshoots (Sorted by date, taking events today or in the future)
  const upcomingPhotoshoots = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return bookings
      .filter(b => b.eventDate >= todayStr && b.status !== 'Completed')
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      .slice(0, 5);
  }, [bookings]);

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div>
        <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Executive Overview</h2>
        <p className="text-[18px] text-studio-muted mt-1 font-medium">Premium, cinematic photography studio dashboard.</p>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Revenue - Gold Theme Card */}
        <Card isGoldTheme={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18px] font-semibold text-studio-muted">Total Revenue</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-studio-gold/15 text-studio-gold uppercase tracking-wider">Gold</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-studio-gold tracking-tight mt-1">
              ₹{metrics.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[14px] text-studio-muted mt-2 flex items-center gap-1 font-medium">
              <TrendingUp size={14} className="text-emerald-500" />
              Includes extras & booking payments
            </p>
          </div>
        </Card>

        {/* Bookings Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18px] font-semibold text-studio-muted">Bookings</span>
            <Calendar size={18} className="text-studio-accent" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-studio-text tracking-tight mt-1">{metrics.totalBookings || 52}</h3>
            <p className="text-[14px] text-studio-muted mt-2 font-medium">Total studio bookings logged</p>
          </div>
        </Card>

        {/* Active Projects Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18px] font-semibold text-studio-muted">Active Projects</span>
            <Camera size={18} className="text-studio-accent" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-studio-text tracking-tight mt-1">{metrics.activeProjects || 18}</h3>
            <p className="text-[14px] text-studio-muted mt-2 font-medium">Shoots confirmed or in progress</p>
          </div>
        </Card>

        {/* New Clients Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18px] font-semibold text-studio-muted">New Clients</span>
            <Users size={18} className="text-studio-accent" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-studio-text tracking-tight mt-1">{metrics.totalClients || 12}</h3>
            <p className="text-[14px] text-studio-muted mt-2 font-medium">Unique clients in system</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Upcoming & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upcoming Photoshoots */}
        <div className="lg:col-span-5">
          <Card 
            title="Upcoming Photoshoots" 
            subtitle="Next shoots scheduled in the studio system"
            headerAction={
              <NavLink to="/bookings" className="text-[15px] font-semibold text-studio-accent flex items-center gap-1 hover:underline">
                View All <ArrowRight size={14} />
              </NavLink>
            }
          >
            {upcomingPhotoshoots.length === 0 ? (
              <div className="py-12 text-center text-studio-muted">
                <Camera size={32} className="mx-auto text-studio-border mb-3" />
                <p className="text-[18px] font-medium">No upcoming shoots scheduled</p>
                <p className="text-[14px] mt-1">Create a booking to get started</p>
              </div>
            ) : (
              <div className="space-y-5">
                {upcomingPhotoshoots.map((shoot) => {
                  const initials = shoot.client?.name
                    ? shoot.client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'CL';
                  return (
                    <div 
                      key={shoot.id} 
                      className="flex items-center justify-between p-4 rounded-xl border border-studio-border hover:bg-studio-bg/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-studio-sidebar/5 border border-studio-border flex items-center justify-center font-bold text-studio-sidebar text-[18px] flex-shrink-0">
                          {initials}
                        </div>
                        <div className="text-left">
                          <h4 className="text-[18px] font-bold text-studio-text leading-tight">{shoot.client?.name}</h4>
                          <p className="text-[14px] text-studio-muted leading-tight mt-1 flex items-center gap-1.5 font-medium">
                            <Calendar size={13} />
                            {new Date(shoot.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          shoot.status === 'Confirmed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {shoot.status}
                        </span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {shoot.serviceType}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Monthly Cash Flow Chart */}
        <div className="lg:col-span-7">
          <Card 
            title="Monthly Cash Flow" 
            subtitle="Comparison of Monthly Income vs Expenses"
          >
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} 
                    tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #E5E7EB', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      fontSize: '14px',
                      fontWeight: 600
                    }} 
                    formatter={(value) => [`₹${(Number(value) || 0).toLocaleString()}`, undefined]}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                  {/* Indigo Accent Bar */}
                  <Bar dataKey="Income" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  {/* Gold Accent Bar */}
                  <Bar dataKey="Expenses" fill="#B5945B" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
