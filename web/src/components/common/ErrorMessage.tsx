interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;
  return (
    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: 8 }}>
      {message}
    </div>
  );
};

export default ErrorMessage;
