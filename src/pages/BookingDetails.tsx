import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import BookingForm from '../components/forms/BookingForm';
import PaymentForm from '../components/forms/PaymentForm';
import confetti from 'canvas-confetti';

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, updateBooking, createPayment, fetchAllData } = useStudioStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showInvoiceNotification, setShowInvoiceNotification] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Find active booking
  const booking = useMemo(() => {
    return bookings.find(b => b.id === id);
  }, [bookings, id]);

  // Calculations
  const metrics = useMemo(() => {
    if (!booking) return { paid: 0, balance: 0 };
    const paid = booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const balance = Math.max(0, booking.totalAmount - paid);
    return { paid, balance };
  }, [booking]);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-studio-muted">
        <AlertCircle size={48} className="text-studio-border mb-3" />
        <h3 className="text-xl font-bold">Booking Not Found</h3>
        <p className="text-[15px] mt-1">The requested booking does not exist or has been deleted.</p>
        <NavLink 
          to="/bookings" 
          className="mt-6 h-[52px] px-6 bg-studio-accent text-white rounded-xl flex items-center gap-2 font-bold hover:bg-studio-accent/90"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </NavLink>
      </div>
    );
  }

  // Handle Booking edit
  const handleEditBookingSubmit = async (formData: any) => {
    try {
      await updateBooking(booking.id, formData);
      setIsEditModalOpen(false);
    } catch (e) {
      alert('Failed to update booking.');
    }
  };

  // Handle Payment creation
  const handleAddPaymentSubmit = async (formData: any) => {
    try {
      await createPayment({
        bookingId: booking.id,
        ...formData
      });
      setIsPaymentModalOpen(false);
      // Trigger success confetti when a payment is added!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      alert('Failed to process payment.');
    }
  };

  // Handle Mock Invoice generation
  const handleGenerateInvoice = () => {
    setShowInvoiceNotification(true);
    setTimeout(() => {
      setShowInvoiceNotification(false);
    }, 4000);
  };

  // Compile vertical timeline/payment history
  const timelineEvents = useMemo(() => {
    const events = [];

    // 1. Initial Booking Confirmed (Total Price)
    events.push({
      date: booking.eventDate,
      title: 'Booking Logged',
      detail: `Booking registered for ₹${booking.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      type: 'system',
    });

    // 2. Payments Timeline
    if (booking.payments && booking.payments.length > 0) {
      // Sort payments by date ascending
      const sortedPayments = [...booking.payments].sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
      
      sortedPayments.forEach((p) => {
        events.push({
          date: p.paymentDate,
          title: 'Payment Received',
          detail: `₹${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} via ${p.paymentMethod}${p.notes ? ` (${p.notes})` : ''}`,
          type: 'payment',
        });
      });
    }

    // 3. Status changes (Current state summary)
    if (metrics.balance === 0) {
      events.push({
        date: new Date().toISOString().split('T')[0],
        title: 'Account Settled',
        detail: 'The booking balance is fully paid.',
        type: 'settled',
      });
    }

    // Sort all events by date descending to show newest first in history
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [booking, metrics.balance]);

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {/* Invoice alert notification */}
      {showInvoiceNotification && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <CheckCircle size={20} />
          <div>
            <p className="font-bold">Invoice Generated Successfully</p>
            <p className="text-xs text-emerald-100">Sent invoice copy to {booking.client?.email || 'client'}</p>
          </div>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="p-3 rounded-xl border border-studio-border hover:bg-studio-bg text-studio-text transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Premium Booking Details</h2>
            <p className="text-[18px] text-studio-muted mt-1 font-medium">
              Review and manage details for booking with {booking.client?.name}.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleGenerateInvoice}
            className="h-[52px] px-5 rounded-xl border border-studio-border hover:bg-studio-bg font-bold text-studio-text flex items-center gap-2 transition-colors duration-200"
          >
            <FileText size={18} />
            Generate Invoice
          </button>
          
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="h-[52px] px-5 rounded-xl border border-studio-accent text-studio-accent hover:bg-studio-accent/5 font-bold flex items-center gap-2 transition-colors duration-200"
          >
            <Edit size={18} />
            Edit Booking
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={metrics.balance === 0}
            className="h-[52px] px-6 rounded-xl bg-studio-accent text-white font-bold flex items-center gap-2 hover:bg-studio-accent/90 disabled:opacity-50 disabled:hover:bg-studio-accent shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </div>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Client Info */}
        <div className="lg:col-span-4">
          <Card title="Client Details" subtitle="Client profile and contact records">
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center text-studio-accent flex-shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Name</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">{booking.client?.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center text-studio-accent flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Contact Email</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1 truncate max-w-[220px]">
                    {booking.client?.email || 'No email registered'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center text-studio-accent flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Phone Number</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">
                    {booking.client?.phone || 'No phone registered'}
                  </p>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center text-studio-accent flex-shrink-0">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Company</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">
                    {booking.client?.company || 'Personal Client'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Booking Info */}
        <div className="lg:col-span-4">
          <Card title="Booking & Event Info" subtitle="Shoot details, locations, and pricing">
            <div className="space-y-6">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-gold/10 border border-studio-gold/20 flex items-center justify-center text-studio-gold flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Date</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">
                    {new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-gold/10 border border-studio-gold/20 flex items-center justify-center text-studio-gold flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">{booking.location || 'Studio Premises'}</p>
                </div>
              </div>

              {/* Service */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-gold/10 border border-studio-gold/20 flex items-center justify-center text-studio-gold flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Service Type</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">{booking.serviceType}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-gold/10 border border-studio-gold/20 flex items-center justify-center text-studio-gold flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Duration</p>
                  <p className="text-[18px] font-bold text-studio-text mt-1">{booking.duration || 'Flexible'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-studio-gold/10 border border-studio-gold/20 flex items-center justify-center text-studio-gold flex-shrink-0">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="text-xs text-studio-muted uppercase tracking-wider font-semibold">Status</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block mt-1 ${
                    booking.status === 'Completed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : booking.status === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 3: Payment History Timeline */}
        <div className="lg:col-span-4">
          <Card title="Payment History" subtitle="Outstanding balance details & payments timeline">
            {/* Balance Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-studio-bg rounded-xl border border-studio-border">
              <div className="text-left">
                <p className="text-xs text-studio-muted font-bold uppercase tracking-wider">Total Price</p>
                <p className="text-xl font-extrabold text-studio-text mt-1">
                  ₹{booking.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-studio-muted font-bold uppercase tracking-wider">Balance Due</p>
                <p className={`text-xl font-extrabold mt-1 ${metrics.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₹{metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-studio-border/60 ml-3 space-y-6 text-left">
              {timelineEvents.map((ev, index) => {
                let dotColor = 'bg-studio-border border-studio-border';
                if (ev.type === 'payment') dotColor = 'bg-studio-accent border-studio-accent/20';
                if (ev.type === 'settled') dotColor = 'bg-emerald-500 border-emerald-500/20';
                if (ev.type === 'system') dotColor = 'bg-studio-gold border-studio-gold/20';

                return (
                  <div key={index} className="relative">
                    {/* Circle Indicator */}
                    <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 flex-shrink-0 ${dotColor}`}></span>
                    <div>
                      <span className="text-[13px] font-bold text-studio-muted block">
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <h4 className="text-[18px] font-bold text-studio-text leading-tight mt-0.5">{ev.title}</h4>
                      <p className="text-[15px] text-studio-muted mt-1 leading-snug">{ev.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Booking Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Studio Booking"
        maxWidthClass="max-w-[700px]"
      >
        <BookingForm
          initialData={booking}
          onSubmit={handleEditBookingSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          isEdit={true}
        />
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Add Booking Payment"
        maxWidthClass="max-w-[700px]"
      >
        <PaymentForm
          onSubmit={handleAddPaymentSubmit}
          onCancel={() => setIsPaymentModalOpen(false)}
          maxAmount={metrics.balance}
        />
      </Modal>
    </div>
  );
};

export default BookingDetails;
