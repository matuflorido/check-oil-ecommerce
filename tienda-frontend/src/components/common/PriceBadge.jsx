export default function PriceBadge({ originalPrice, finalPrice, showDiscount = true }) {
  const hasDiscount = originalPrice > finalPrice;
  const discountPercent = originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex items-center gap-3">
      {hasDiscount && (
        <>
          <span className="text-sm line-through text-dark-text-muted">
            ${originalPrice.toFixed(2)}
          </span>
          {showDiscount && (
            <span className="text-xs bg-check-orange text-dark-bg px-2 py-1 rounded font-bold">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
      <span className={`text-lg font-bold ${hasDiscount ? 'text-check-orange' : 'text-dark-text'}`}>
        ${finalPrice.toFixed(2)}
      </span>
    </div>
  );
}
