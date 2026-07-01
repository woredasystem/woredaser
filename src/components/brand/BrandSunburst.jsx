/**
 * Radial sunburst backdrop matching the official brand seal (#004694).
 */
export default function BrandSunburst({
  children,
  className = '',
  variant = 'default',
  vignette = true,
  as: Tag = 'div',
}) {
  const bgClass = variant === 'subtle' ? 'brand-sunburst-bg-subtle' : 'brand-sunburst-bg'
  const vignetteClass = vignette ? '' : 'brand-sunburst-plain'

  return (
    <Tag className={`${bgClass} ${vignetteClass} ${className}`}>
      {children}
    </Tag>
  )
}
