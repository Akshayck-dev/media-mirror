import React, { useState } from 'react';
import FormInput from '../ui/FormInput';
import type { Booking } from '../../electron';

interface BookingFormProps {
  initialData?: Partial<Booking>;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [clientName, setClientName] = useState(initialData?.client?.name || '');
  const [clientEmail, setClientEmail] = useState(initialData?.client?.email || '');
  const [clientPhone, setClientPhone] = useState(initialData?.client?.phone || '');
  const [clientCompany, setClientCompany] = useState(initialData?.client?.company || '');
  
  const [eventDate, setEventDate] = useState(initialData?.eventDate || new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState(initialData?.serviceType || 'Portrait Shoot');
  const [location, setLocation] = useState(initialData?.location || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount?.toString() || '');
  const [status, setStatus] = useState<'Pending' | 'Confirmed' | 'Completed'>(
    (initialData?.status as 'Pending' | 'Confirmed' | 'Completed') || 'Pending'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceOptions = [
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Pre-Wedding', label: 'Pre-Wedding' },
    { value: 'Engagement', label: 'Engagement' },
    { value: 'Event Shoot', label: 'Event Shoot' },
    { value: 'Family Shoot', label: 'Family Shoot' },
    { value: 'Passport Photos', label: 'Passport Photos' },
    { value: 'Portrait Shoot', label: 'Portrait Shoot' },
    { value: 'Other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!isEdit && !clientName.trim()) tempErrors.clientName = 'Client Name is required';
    if (!eventDate) tempErrors.eventDate = 'Event Date is required';
    if (!totalAmount || parseFloat(totalAmount) < 0) tempErrors.totalAmount = 'Valid Total Amount is required';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    onSubmit({
      clientName: isEdit ? initialData?.client?.name : clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      eventDate,
      serviceType,
      location,
      duration,
      totalAmount: parseFloat(totalAmount),
      status,
      clientId: initialData?.clientId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full max-w-[700px] mx-auto text-left">
      {/* Client Section (Only show if not editing, or read-only/prefilled) */}
      {!isEdit && (
        <fieldset className="border border-studio-border rounded-xl p-5 mb-5 bg-studio-bg/20">
          <legend className="px-2 text-sm font-semibold text-studio-gold uppercase tracking-wider">Client Details</legend>
          <FormInput
            label="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            error={errors.clientName}
            required
            placeholder="Johnathan Doe"
          />
          <FormInput
            label="Email Address"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@email.com"
          />
          <FormInput
            label="Phone Number"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <FormInput
            label="Company Name"
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
            placeholder="Company LLC"
          />
        </fieldset>
      )}

      {/* Shoot Info Section */}
      <fieldset className="border border-studio-border rounded-xl p-5 mb-6 bg-studio-bg/20">
        <legend className="px-2 text-sm font-semibold text-studio-gold uppercase tracking-wider">Event & Booking Info</legend>
        
        <FormInput
          label="Event Date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          error={errors.eventDate}
          required
        />

        <FormInput
          label="Service Type"
          as="select"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          options={serviceOptions}
        />

        <FormInput
          label="Shoot Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Studio A, Main Floor"
        />

        <FormInput
          label="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 4 Hours"
        />

        <FormInput
          label="Total Price (₹)"
          type="number"
          step="0.01"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          error={errors.totalAmount}
          required
          placeholder="0.00"
        />

        <FormInput
          label="Booking Status"
          as="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'Pending' | 'Confirmed' | 'Completed')}
          options={statusOptions}
        />
      </fieldset>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-studio-border pt-5 mt-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="h-[52px] px-6 rounded-xl border border-studio-border font-bold text-studio-text hover:bg-studio-bg hover:text-studio-text transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[52px] px-8 rounded-xl bg-studio-accent text-white font-bold hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
        >
          {isEdit ? 'Save Changes' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
