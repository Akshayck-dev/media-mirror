import React, { useState } from 'react';
import FormInput from '../ui/FormInput';

interface PaymentFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  maxAmount: number;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onCancel,
  maxAmount,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const methodOptions = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Apple Pay', label: 'Apple Pay' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    const floatAmount = parseFloat(amount);
    if (!amount || isNaN(floatAmount) || floatAmount <= 0) {
      tempErrors.amount = 'Valid payment amount is required';
    } else if (floatAmount > maxAmount) {
      tempErrors.amount = `Payment amount exceeds the outstanding balance (₹${maxAmount.toFixed(2)})`;
    }

    if (!paymentDate) {
      tempErrors.paymentDate = 'Payment Date is required';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    onSubmit({
      amount: floatAmount,
      paymentDate,
      paymentMethod,
      notes: notes.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full max-w-[700px] mx-auto text-left">
      <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-indigo-700">Remaining Balance:</span>
        <span className="text-xl font-bold text-indigo-900">₹{maxAmount.toFixed(2)}</span>
      </div>

      <FormInput
        label="Payment Amount (₹)"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        required
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
        options={methodOptions}
      />

      <FormInput
        label="Transaction Notes"
        as="textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Deposit check clear or transaction ID info"
      />

      {/* Buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-studio-border pt-5 mt-4 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="h-[52px] px-6 rounded-xl border border-studio-border font-bold text-studio-text hover:bg-studio-bg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[52px] px-8 rounded-xl bg-studio-accent text-white font-bold hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
        >
          Add Payment
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
