import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/forms/BookingForm';
import exportToExcel from '../lib/exportExcel';

export const Bookings: React.FC = () => {
  const { bookings, createBooking, deleteBooking, fetchAllData } = useStudioStore();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Booking Creation
  const handleCreateBooking = async (formData: any) => {
    try {
      await createBooking(formData);
      setIsAddModalOpen(false);
    } catch (e) {
      alert('Failed to create booking. Please try again.');
    }
  };

  // Handle Booking Deletion
  const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      try {
        await deleteBooking(bookingToDelete);
        setBookingToDelete(null);
      } catch (e) {
        alert('Failed to delete booking.');
      }
    }
  };

  // Calculate Balance for each booking
  const bookingsWithBalances = useMemo(() => {
    return bookings.map(b => {
      const paid = b.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const balance = Math.max(0, b.totalAmount - paid);
      return {
        ...b,
        paid,
        balance
      };
    });
  }, [bookings]);

  // Filter and Search bookings
  const filteredBookings = useMemo(() => {
    return bookingsWithBalances.filter((b) => {
      const matchesSearch = b.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookingsWithBalances, searchTerm, statusFilter]);

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));

  // Reset page on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Excel Export Handler
  const handleExport = () => {
    const exportData = filteredBookings.map((b) => ({
      'Client Name': b.client?.name,
      'Email': b.client?.email || 'N/A',
      'Phone': b.client?.phone || 'N/A',
      'Event Date': b.eventDate,
      'Service Type': b.serviceType,
      'Location': b.location || 'N/A',
      'Duration': b.duration || 'N/A',
      'Total Amount (INR)': b.totalAmount,
      'Paid Amount (INR)': b.paid,
      'Outstanding Balance (INR)': b.balance,
      'Status': b.status,
    }));
    exportToExcel(exportData, `Bookings_Export_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Bookings Management</h2>
          <p className="text-[18px] text-studio-muted mt-1 font-medium">Review and manage all incoming studio client bookings.</p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleExport}
            className="h-[52px] px-5 rounded-xl border border-studio-border hover:bg-studio-bg font-bold text-studio-text flex items-center gap-2 transition-colors duration-200"
          >
            <Download size={18} />
            Export Excel
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-[52px] px-6 rounded-xl bg-studio-accent text-white font-bold flex items-center gap-2 hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
          >
            <Plus size={18} />
            Add New Booking
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
              placeholder="Search clients or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[52px] w-full pl-12 pr-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent transition-all bg-white text-studio-text"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent transition-all bg-white text-studio-text"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Card Container */}
      <Card className="overflow-hidden p-0 border-studio-border">
        {filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-studio-muted">
            <Calendar size={48} className="mx-auto text-studio-border mb-3 animate-pulse" />
            <p className="text-[20px] font-bold">No bookings found</p>
            <p className="text-[15px] mt-1">Try relaxing your search terms or create a new booking.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-studio-bg/50 border-b border-studio-border">
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Client</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Event Date</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Service Type</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Total Amount</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Balance</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-center">Status</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border">
                  {paginatedBookings.map((b) => {
                    const initials = b.client?.name
                      ? b.client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'CL';
                    const hasBalance = b.balance > 0;
                    
                    return (
                      <tr 
                        key={b.id} 
                        className="hover:bg-studio-bg/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/bookings/${b.id}`)}
                      >
                        {/* Client details with initials badge */}
                        <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                          <div 
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => navigate(`/bookings/${b.id}`)}
                          >
                            <div className="w-11 h-11 rounded-full bg-studio-sidebar/5 border border-studio-border flex items-center justify-center font-bold text-studio-sidebar text-[16px] flex-shrink-0 group-hover:bg-studio-gold/10 group-hover:text-studio-gold group-hover:border-studio-gold/30 transition-all duration-200">
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-[18px] font-bold text-studio-text leading-tight group-hover:text-studio-accent transition-colors">{b.client?.name}</h4>
                              {b.client?.company && (
                                <p className="text-[14px] text-studio-muted leading-tight mt-1">{b.client.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Event Date */}
                        <td className="py-5 px-6 text-[18px] font-medium text-studio-text">
                          {new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        
                        {/* Service Type */}
                        <td className="py-5 px-6">
                          <span className="text-[14px] bg-studio-bg text-studio-text font-bold px-3 py-1.5 rounded-lg border border-studio-border">
                            {b.serviceType}
                          </span>
                        </td>
                        
                        {/* Total Amount */}
                        <td className="py-5 px-6 text-[18px] font-bold text-studio-text text-right">
                          ₹{b.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        
                        {/* Balance */}
                        <td className="py-5 px-6 text-right">
                          <span className={`text-[18px] font-bold ${hasBalance ? 'text-red-600' : 'text-studio-muted'}`}>
                            ₹{b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        
                        {/* Status */}
                        <td className="py-5 px-6 text-center">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border inline-block min-w-[100px] ${
                            b.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : b.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => navigate(`/bookings/${b.id}`)}
                              className="p-2 rounded-lg hover:bg-studio-bg border border-transparent hover:border-studio-border text-studio-muted hover:text-studio-accent transition-all duration-200"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setBookingToDelete(b.id)}
                              className="p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 text-studio-muted hover:text-red-600 transition-all duration-200"
                              title="Delete booking"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-6 py-5 border-t border-studio-border bg-studio-bg/10 flex items-center justify-between flex-shrink-0">
              <span className="text-[15px] font-semibold text-studio-muted">
                Showing {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
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

      {/* Add Booking Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Studio Booking"
        maxWidthClass="max-w-[700px]"
      >
        <BookingForm
          onSubmit={handleCreateBooking}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={bookingToDelete !== null}
        onClose={() => setBookingToDelete(null)}
        title="Delete Booking Confirmation"
        maxWidthClass="max-w-[500px]"
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-studio-text">Are you absolutely sure?</h3>
          <p className="text-[15px] text-studio-muted mt-2">
            This action will permanently delete the booking record and all associated payment logs. This cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setBookingToDelete(null)}
              className="h-[52px] px-6 rounded-xl border border-studio-border font-bold text-studio-text hover:bg-studio-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="h-[52px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/10 hover:shadow-red-600/20 transition-all"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
