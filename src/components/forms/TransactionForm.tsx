import React, { useState } from 'react';
import FormInput from '../ui/FormInput';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSubmit,
  onCancel,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic field for Income vs Expense
  const [source, setSource] = useState(''); // for income
  const [category, setCategory] = useState('Studio Rent'); // for expense

  const expenseCategories = [
    { value: 'Studio Rent', label: 'Studio Rent' },
    { value: 'Software subscription', label: 'Software subscription' },
    { value: 'Equipment rental', label: 'Equipment rental' },
    { value: 'Marketing/Ads', label: 'Marketing/Ads' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Studio Upkeep', label: 'Studio Upkeep' },
    { value: 'Travel/Transport', label: 'Travel/Transport' },
    { value: 'Other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    const floatAmount = parseFloat(amount);
    if (!amount || isNaN(floatAmount) || floatAmount <= 0) {
      tempErrors.amount = 'Valid amount is required';
    }
    if (!date) tempErrors.date = 'Date is required';

    if (type === 'income' && !source.trim()) {
      tempErrors.source = 'Source description is required';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    const payload = {
      date,
      amount: floatAmount,
      notes: notes.trim() || null,
      ...(type === 'income' ? { source: source.trim() } : { category }),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full max-w-[700px] mx-auto text-left">
      <FormInput
        label="Transaction Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        required
      />

      {type === 'income' ? (
        <FormInput
          label="Income Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          error={errors.source}
          required
          placeholder="e.g. Frame Sales, Album Printing, Studio Hire"
        />
      ) : (
        <FormInput
          label="Expense Category"
          as="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={expenseCategories}
        />
      )}

      <FormInput
        label="Amount (₹)"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        required
        placeholder="0.00"
      />

      <FormInput
        label="Additional Notes"
        as="textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Transaction details, invoice numbers"
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
          className="h-[52px] px-8 rounded-xl bg-studio-accent text-white font-bold hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 transition-all duration-200"
        >
          {type === 'income' ? 'Add Income' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
