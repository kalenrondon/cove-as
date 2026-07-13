export default function Modal({ show, onClose, title, children }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        {title && <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
