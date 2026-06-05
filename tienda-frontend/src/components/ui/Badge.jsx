export default function Badge({ children, type = 'info', className = '' }) {
  const types = {
    info: 'bg-blue-600/20 text-blue-400',
    success: 'bg-green-600/20 text-green-400',
    warning: 'bg-yellow-600/20 text-yellow-400',
    danger: 'bg-red-600/20 text-red-400',
    discount: 'bg-check-orange/20 text-check-orange',
    stock: 'bg-green-600/20 text-green-400'
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${types[type]} ${className}`}>
      {children}
    </span>
  )
}
