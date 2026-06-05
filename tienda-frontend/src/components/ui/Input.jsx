export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  name,
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-text">
          {label}
          {required && <span className="text-check-orange ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          px-4 py-2 rounded-lg
          bg-dark-secondary text-dark-text
          border border-dark-secondary focus:border-check-orange
          placeholder-dark-text-muted
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-1 focus:ring-check-orange
          transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
