// Shown wherever a product/category has no photo. Lightspeed items without an
// uploaded image come through with no image URL at all, and an <img> with an
// empty src renders as a broken-image icon.
export default function ImagePlaceholder({ label = 'No image available' }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid h-full w-full place-items-center bg-neutral-100 p-2 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-400"
    >
      {label}
    </div>
  )
}
