import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  TrendingUp, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import exportToExcel from '../lib/exportExcel';

export const Income: React.FC = () => {
  const { income, createIncome, deleteIncome } = useStudioStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form submission
  const handleAddIncome = async (formData: any) => {
    try {
      await createIncome(formData);
      setIsAddModalOpen(false);
    } catch (e) {
      alert('Failed to log income.');
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (incomeToDelete) {
      try {
        await deleteIncome(incomeToDelete);
        setIncomeToDelete(null);
      } catch (e) {
        alert('Failed to delete income record.');
      }
    }
  };

  // Filter Income logs
  const filteredIncome = useMemo(() => {
    return income.filter(inc => {
      return inc.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (inc.notes && inc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [income, searchTerm]);

  // Paginated Income
  const paginatedIncome = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncome.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncome, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredIncome.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Excel export
  const handleExport = () => {
    const exportData = filteredIncome.map(inc => ({
      'Date': inc.date,
      'Source': inc.source,
      'Amount (INR)': inc.amount,
      'Notes': inc.notes || 'N/A'
    }));
    exportToExcel(exportData, `Income_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Income Registry</h2>
          <p className="text-[18px] text-studio-muted mt-1 font-medium">Review and record additional studio revenue sources.</p>
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
            Add Income
          </button>
        </div>
      </div>

      {/* Search Filter Card */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-studio-muted" size={20} />
          <input
            type="text"
            placeholder="Search income by source or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-[52px] w-full pl-12 pr-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
          />
        </div>
      </Card>

      {/* Income Table */}
      <Card className="overflow-hidden p-0 border-studio-border">
        {filteredIncome.length === 0 ? (
          <div className="py-20 text-center text-studio-muted">
            <TrendingUp size={48} className="mx-auto text-studio-border mb-3 animate-pulse" />
            <p className="text-[20px] font-bold">No income records found</p>
            <p className="text-[15px] mt-1">Add items like Album Sales, Studio Rentals, or Frame prints.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-studio-bg/50 border-b border-studio-border">
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Date</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider">Source</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-right">Amount</th>
                    <th className="py-5 px-6 text-[15px] font-bold text-studio-muted uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border">
                  {paginatedIncome.map((inc) => (
                    <tr key={inc.id} className="hover:bg-studio-bg/30 transition-colors">
                      <td className="py-5 px-6 text-[18px] font-medium text-studio-text">
                        {new Date(inc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-5 px-6">
                        <h4 className="text-[18px] font-bold text-studio-text leading-tight">{inc.source}</h4>
                        {inc.notes && <p className="text-[13px] text-studio-muted mt-1 font-medium">{inc.notes}</p>}
                      </td>
                      <td className="py-5 px-6 text-[18px] font-extrabold text-emerald-600 text-right">
                        +₹{inc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => setIncomeToDelete(inc.id)}
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
                Showing {Math.min(currentPage * itemsPerPage, filteredIncome.length)} of {filteredIncome.length} records
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

      {/* Add Income Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Supplementary Studio Income"
        maxWidthClass="max-w-[700px]"
      >
        <TransactionForm
          type="income"
          onSubmit={handleAddIncome}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={incomeToDelete !== null}
        onClose={() => setIncomeToDelete(null)}
        title="Delete Income Record"
        maxWidthClass="max-w-[500px]"
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-studio-text">Are you sure?</h3>
          <p className="text-[15px] text-studio-muted mt-2">
            This will permanently remove this income transaction from the studio books. This cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setIncomeToDelete(null)}
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

export default Income;
