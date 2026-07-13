import { useState, useEffect } from 'react'
import Modal from './Modal'

export default function EditPersonModal({ show, onClose, onSubmit, edit }) {
  const [name, setName] = useState('')
  useEffect(() => {
    if (edit) setName(edit.name || '')
    else setName('')
  }, [edit, show])
  return (
    <Modal show={show} onClose={onClose} title="Editar Persona">
      <form onSubmit={e => { e.preventDefault(); onSubmit(name) }} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" autoFocus />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary-light">Guardar</button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>
        </div>
      </form>
    </Modal>
  )
}
