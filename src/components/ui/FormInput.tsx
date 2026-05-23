import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  type?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  as = 'input',
  options = [],
  error,
  className = '',
  id,
  ...props
}) => {
  const baseClasses = "w-full border border-studio-border rounded-xl px-4 text-[18px] bg-white text-studio-text focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent transition-all duration-200";
  const heightClasses = as === 'textarea' ? 'py-3 min-h-[120px]' : 'h-[52px]';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500/20' : '';
  
  const resolvedId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full flex flex-col mb-5 max-w-[700px]">
      <label 
        htmlFor={resolvedId} 
        className="form-label text-[18px] font-semibold text-studio-text mb-2 text-left"
      >
        {label}
      </label>
      
      {as === 'input' && (
        <input
          id={resolvedId}
          type={type}
          className={`${baseClasses} ${heightClasses} ${errorClasses} ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {as === 'select' && (
        <select
          id={resolvedId}
          className={`${baseClasses} ${heightClasses} ${errorClasses} ${className}`}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {as === 'textarea' && (
        <textarea
          id={resolvedId}
          className={`${baseClasses} ${heightClasses} ${errorClasses} ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )}

      {error && (
        <span className="text-red-500 text-sm mt-1 text-left">{error}</span>
      )}
    </div>
  );
};

export default FormInput;
