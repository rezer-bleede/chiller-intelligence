import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormInput = ({ label, error, hint, ...props }: FormInputProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={props.id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </label>
    <input
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-700/40"
      {...props}
    />
    {hint ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    {error ? <small className="text-sm text-red-500">{error}</small> : null}
  </div>
);

export default FormInput;
