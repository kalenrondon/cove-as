import { useState, useEffect } from 'react'
import Modal from './Modal'

export default function FamilyModal({ show, onClose, onSubmit, edit, familyMembers }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [head_id, setHeadId] = useState('')

  useEffect(() => {
    if (edit) {
      setName(edit.name)
      setColor(edit.color || '#3B82F6')
      setHeadId(edit.head_id ? String(edit.head_id) : '')
    } else { setName(''); setColor('#3B82F6'); setHeadId('') }
  }, [edit, show])

  return (
    <Modal show={show} onClose={onClose} title={edit ? 'Editar Familia' : 'Nueva Familia'}>
      <form onSubmit={e => { e.preventDefault(); onSubmit({ name, color, head_id: head_id ? Number(head_id) : null }) }} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer dark:bg-gray-700" />
        </div>
        {edit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cabeza de familia</label>
            <select value={head_id} onChange={e => setHeadId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none">
              <option value="">Seleccionar...</option>
              {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary-light">Guardar</button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
