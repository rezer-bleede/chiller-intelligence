import { SelectHTMLAttributes } from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

const SelectInput = ({ label, options, error, ...props }: SelectInputProps) => (
  <div className="form-group">
    <label htmlFor={props.id}>{label}</label>
    <select {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error ? <small style={{ color: '#b91c1c' }}>{error}</small> : null}
  </div>
);

export default SelectInput;
