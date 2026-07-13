import { useState, useEffect } from 'react'
import Modal from './Modal'
import { formatCurrency, parseCurrency } from '../utils/currency'

const CATEGORIES = ['General', 'Transporte', 'Alojamiento', 'Comida', 'Actividades', 'Otros']

export default function ExpenseModal({ show, onClose, onSubmit, edit }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('General')
  useEffect(() => {
    if (edit) { setDescription(edit.description); setAmount(formatCurrency(String(edit.amount))); setDate(edit.date); setCategory(edit.category || 'General') }
    else { setDescription(''); setAmount(''); setDate(new Date().toISOString().split('T')[0]); setCategory('General') }
  }, [edit, show])
  return (
    <Modal show={show} onClose={onClose} title={edit ? 'Editar Meta' : 'Registrar Meta'}>
      <form onSubmit={e => { e.preventDefault(); onSubmit({ description, amount: parseCurrency(amount), date, category }) }} className="space-y-3">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label><input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto ($)</label><input type="text" inputMode="decimal" required value={amount} onChange={e => setAmount(formatCurrency(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary-light">Guardar</button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
