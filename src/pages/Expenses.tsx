import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  TrendingDown, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import exportToExcel from '../lib/exportExcel';

export const Expenses: React.FC = () => {
  const { expenses, createExpense, deleteExpense } = useStudioStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form submission
  const handleAddExpense = async (formData: any) => {
    try {
      await createExpense(formData);
      setIsAddModalOpen(false);
    } catch (e) {
      alert('Failed to log expense.');
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete);
        setExpenseToDelete(null);
      } catch (e) {
        alert('Failed to delete expense record.');
      }
    }
  };

  // Filter Expense logs
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  // Paginated Expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // Excel export
  const handleExport = () => {
    const exportData = filteredExpenses.map(exp => ({
      'Date': exp.date,
      'Category': exp.category,
      'Amount (INR)': exp.amount,
      'Notes': exp.notes || 'N/A'
    }));
    exportToExcel(exportData, `Expenses_Overheads_${new Date().toISOString().split('T')[0]}`);
  };

  const expenseCategories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Studio Rent', label: 'Studio Rent' },
    { value: 'Software subscription', label: 'Software subscription' },
    { value: 'Equipment rental', label: 'Equipment rental' },
    { value: 'Marketing/Ads', label: 'Marketing/Ads' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Studio Upkeep', label: 'Studio Upkeep' },
    { value: 'Travel/Transport', label: 'Travel/Transport' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Expenses & Overheads</h2>
          <p className="text-[18px] text-studio-muted mt-1 font-medium">Review and record operational overhead expenses.</p>
        </div>
        
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
            Add Expense
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
              placeholder="Search expenses by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[52px] w-full pl-12 pr-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
            >
              {expenseCategories.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden p-0 border-studio-border">
        {filteredExpenses.length === 0 ? (
          <div className="py-20 text-center text-studio-muted">
            <TrendingDown size={48} className="mx-auto text-studio-border mb-3 animate-pulse" />
            <p className="text-[20px] font-bold">No expenses found</p>
            <p className="text-[15px] mt-1">Add items like rent, camera lens rentals, or software fees.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-studio-bg/50 border-b border-studio-border">
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Date</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Category</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Amount</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border">
                  {paginatedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-studio-bg/30 transition-colors">
                      <td className="py-5 px-6 text-[18px] font-medium text-studio-text">
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-5 px-6">
                        <h4 className="text-[18px] font-bold text-studio-text leading-tight">{exp.category}</h4>
                        {exp.notes && <p className="text-[13px] text-studio-muted mt-1 font-medium">{exp.notes}</p>}
                      </td>
                      <td className="py-5 px-6 text-[18px] font-extrabold text-red-650 text-right">
                        -₹{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => setExpenseToDelete(exp.id)}
                          className="p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 text-studio-muted hover:text-red-600 transition-all duration-200"
                          title="Delete record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-5 border-t border-studio-border bg-studio-bg/10 flex items-center justify-between flex-shrink-0">
              <span className="text-[15px] font-semibold text-studio-muted">
                Showing {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} records
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Studio Overhead Expense"
        maxWidthClass="max-w-[700px]"
      >
        <TransactionForm
          type="expense"
          onSubmit={handleAddExpense}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense Record"
        maxWidthClass="max-w-[500px]"
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-studio-text">Are you sure?</h3>
          <p className="text-[15px] text-studio-muted mt-2">
            This will permanently remove this expense transaction from the studio books. This cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setExpenseToDelete(null)}
              className="h-[52px] px-6 rounded-xl border border-studio-border font-bold text-studio-text hover:bg-studio-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="h-[52px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
            >
              Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
