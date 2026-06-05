export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded transition flex items-center gap-2 justify-center'

  const variants = {
    primary: 'bg-check-orange hover:bg-check-orange-dark text-dark-bg disabled:bg-dark-text-muted',
    secondary: 'border border-dark-text/30 hover:border-check-orange text-dark-text hover:text-check-orange disabled:text-dark-text-muted',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-dark-text-muted'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  }

  const buttonClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
