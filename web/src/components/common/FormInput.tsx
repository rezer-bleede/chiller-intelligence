import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = ({ label, error, ...props }: FormInputProps) => (
  <div className="form-group">
    <label htmlFor={props.id}>{label}</label>
    <input {...props} />
    {error ? <small style={{ color: '#b91c1c' }}>{error}</small> : null}
  </div>
);

export default FormInput;
