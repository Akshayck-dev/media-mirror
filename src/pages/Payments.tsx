import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import FormInput from '../components/ui/FormInput';
import exportToExcel from '../lib/exportExcel';
import confetti from 'canvas-confetti';

export const Payments: React.FC = () => {
  const { bookings, payments, createPayment, fetchAllData } = useStudioStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states inside Add Payment Modal
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset modal states when closed
  const resetForm = () => {
    setSelectedBookingId('');
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Credit Card');
    setNotes('');
    setErrors({});
  };

  // Find bookings that have outstanding balances to populate selection dropdown
  const bookingsWithBalances = useMemo(() => {
    return bookings.map(b => {
      const paid = b.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const balance = Math.max(0, b.totalAmount - paid);
      return { ...b, paid, balance };
    }).filter(b => b.balance > 0);
  }, [bookings]);

  // Find current selected booking details
  const selectedBooking = useMemo(() => {
    return bookingsWithBalances.find(b => b.id === selectedBookingId);
  }, [bookingsWithBalances, selectedBookingId]);

  // Auto-set the remaining balance as payment amount for ease of use
  useEffect(() => {
    if (selectedBooking) {
      setAmount(selectedBooking.balance.toString());
    } else {
      setAmount('');
    }
  }, [selectedBooking]);

  // Form Submission
  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!selectedBookingId) tempErrors.selectedBookingId = 'Please select a client booking';
    
    const floatAmount = parseFloat(amount);
    if (!amount || isNaN(floatAmount) || floatAmount <= 0) {
      tempErrors.amount = 'Valid amount is required';
    } else if (selectedBooking && floatAmount > selectedBooking.balance) {
      tempErrors.amount = `Amount exceeds outstanding balance (₹${selectedBooking.balance.toFixed(2)})`;
    }

    if (!paymentDate) tempErrors.paymentDate = 'Payment date is required';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      await createPayment({
        bookingId: selectedBookingId,
        amount: floatAmount,
        paymentDate,
        paymentMethod,
        notes: notes.trim() || null
      });
      setIsAddModalOpen(false);
      resetForm();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      alert('Failed to process payment.');
    }
  };

  // Compile payment data with client names and remaining balances
  const enrichedPayments = useMemo(() => {
    // Build list of bookings maps for easy reference
    const bMap = new Map();
    bookings.forEach(b => {
      const paid = b.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const balance = Math.max(0, b.totalAmount - paid);
      bMap.set(b.id, {
        clientName: b.client?.name || 'N/A',
        totalAmount: b.totalAmount,
        balance
      });
    });

    return payments.map(p => {
      const bInfo = bMap.get(p.bookingId) || { clientName: p.booking?.client?.name || 'N/A', balance: 0 };
      return {
        ...p,
        clientName: bInfo.clientName,
        remainingBalance: bInfo.balance,
      };
    });
  }, [payments, bookings]);

  // Search & Filters
  const filteredPayments = useMemo(() => {
    return enrichedPayments.filter(p => {
      const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [enrichedPayments, searchTerm, methodFilter]);

  // Paginated Payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, methodFilter]);

  // Excel Export Handler
  const handleExport = () => {
    const exportData = filteredPayments.map(p => ({
      'Date': p.paymentDate,
      'Client': p.clientName,
      'Amount Paid (INR)': p.amount,
      'Payment Method': p.paymentMethod,
      'Notes': p.notes || 'N/A',
      'Remaining Balance (INR)': p.remainingBalance,
    }));
    exportToExcel(exportData, `Payments_History_${new Date().toISOString().split('T')[0]}`);
  };

  const methodOptions = [
    { value: 'All', label: 'All Methods' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Apple Pay', label: 'Apple Pay' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Premium Payment History</h2>
          <p className="text-[18px] text-studio-muted mt-1 font-medium">Review and manage all incoming studio client payments.</p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleExport}
            className="h-[52px] px-5 rounded-xl border border-studio-border hover:bg-studio-bg font-bold text-studio-text flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Export Excel
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-[52px] px-6 rounded-xl bg-studio-accent text-white font-bold flex items-center gap-2 hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-studio-muted" size={20} />
            <input
              type="text"
              placeholder="Search by client or method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[52px] w-full pl-12 pr-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent transition-all bg-white text-studio-text"
            />
          </div>

          {/* Method Filter */}
          <div className="md:col-span-4">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent transition-all bg-white text-studio-text"
            >
              {methodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Payments History Card Table */}
      <Card className="overflow-hidden p-0 border-studio-border">
        {filteredPayments.length === 0 ? (
          <div className="py-20 text-center text-studio-muted">
            <CreditCard size={48} className="mx-auto text-studio-border mb-3 animate-pulse" />
            <p className="text-[20px] font-bold">No payments found</p>
            <p className="text-[15px] mt-1">Try relaxing your search terms or record a new client payment.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-studio-bg/50 border-b border-studio-border">
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Date</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Client</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Amount</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-center">Method</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border">
                  {paginatedPayments.map((p) => {
                    const remains = p.remainingBalance > 0;
                    
                    // Colors for method tags matching mockup style
                    let tagColor = 'bg-gray-50 text-gray-700 border-gray-200';
                    if (p.paymentMethod === 'Credit Card') tagColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (p.paymentMethod === 'Bank Transfer') tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (p.paymentMethod === 'Cash') tagColor = 'bg-teal-50 text-teal-700 border-teal-200';
                    if (p.paymentMethod === 'Apple Pay') tagColor = 'bg-purple-50 text-purple-700 border-purple-200';
                    if (p.paymentMethod === 'UPI') tagColor = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={p.id} className="hover:bg-studio-bg/30 transition-colors">
                        <td className="py-5 px-6 text-[18px] font-medium text-studio-text">
                          {new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-5 px-6">
                          <h4 className="text-[18px] font-bold text-studio-text leading-tight">{p.clientName}</h4>
                          {p.notes && <p className="text-[13px] text-studio-muted mt-1 font-medium">{p.notes}</p>}
                        </td>
                        <td className="py-5 px-6 text-[18px] font-extrabold text-studio-text text-right">
                          ₹{p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className={`text-[14px] font-semibold px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${tagColor}`}>
                            <CreditCard size={13} />
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className={`text-[18px] font-bold ${remains ? 'text-red-600' : 'text-studio-muted'}`}>
                            ₹{p.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-5 border-t border-studio-border bg-studio-bg/10 flex items-center justify-between flex-shrink-0">
              <span className="text-[15px] font-semibold text-studio-muted">
                Showing {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} transactions
              </span>
              
              <div className="flex items-center gap-1.5 select-none">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 border border-studio-border bg-white rounded-lg flex items-center justify-center text-studio-text hover:bg-studio-bg disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 font-bold rounded-lg border flex items-center justify-center text-[15px] transition-colors ${
                      currentPage === page
                        ? 'bg-studio-accent border-studio-accent text-white shadow-md shadow-indigo-600/10'
                        : 'bg-white border-studio-border text-studio-text hover:bg-studio-bg'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 border border-studio-border bg-white rounded-lg flex items-center justify-center text-studio-text hover:bg-studio-bg disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Record Client Booking Payment"
        maxWidthClass="max-w-[700px]"
      >
        <form onSubmit={handleAddPaymentSubmit} className="flex flex-col gap-1 w-full max-w-[700px] text-left">
          {/* Booking Select */}
          <div className="w-full flex flex-col mb-5">
            <label className="form-label text-[18px] font-semibold text-studio-text mb-2">Select Active Booking</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
            >
              <option value="">-- Choose active booking with balance --</option>
              {bookingsWithBalances.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.client?.name} - {b.serviceType} (₹{b.balance.toFixed(2)} due)
                </option>
              ))}
            </select>
            {errors.selectedBookingId && <span className="text-red-500 text-sm mt-1">{errors.selectedBookingId}</span>}
          </div>

          {selectedBooking && (
            <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-indigo-700">Remaining Balance:</span>
              <span className="text-xl font-bold text-indigo-900">₹{selectedBooking.balance.toFixed(2)}</span>
            </div>
          )}

          <FormInput
            label="Payment Amount (INR)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            required
            disabled={!selectedBookingId}
            placeholder="0.00"
          />

          <FormInput
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            error={errors.paymentDate}
            required
          />

          <FormInput
            label="Payment Method"
            as="select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Apple Pay', label: 'Apple Pay' },
            ]}
          />

          <FormInput
            label="Transaction Notes"
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Deposit check or online transaction reference number"
          />

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-studio-border pt-5 mt-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => { setIsAddModalOpen(false); resetForm(); }}
              className="h-[52px] px-6 rounded-xl border border-studio-border font-bold text-studio-text hover:bg-studio-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[52px] px-8 rounded-xl bg-studio-accent text-white font-bold hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 transition-all"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
