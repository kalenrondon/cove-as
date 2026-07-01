import { useState, useEffect } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

// ─── Family Modal ───
function FamilyModal({ show, onClose, onSubmit, edit, familyMembers }) {
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

  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">{edit ? 'Editar Familia' : 'Nueva Familia'}</h3>
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
      </div>
    </div>
  )
}

// ─── Edit Person Modal (inline editing via modal) ───
function EditPersonModal({ show, onClose, onSubmit, edit }) {
  const [name, setName] = useState('')
  useEffect(() => {
    if (edit) setName(edit.name || '')
    else setName('')
  }, [edit, show])
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Editar Persona</h3>
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
      </div>
    </div>
  )
}

// ─── Expense Modal ───
function ExpenseModal({ show, onClose, onSubmit, edit }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('General')
  useEffect(() => {
    if (edit) { setDescription(edit.description); setAmount(formatCurrency(String(edit.amount))); setDate(edit.date); setCategory(edit.category || 'General') }
    else { setDescription(''); setAmount(''); setDate(new Date().toISOString().split('T')[0]); setCategory('General') }
  }, [edit, show])
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">{edit ? 'Editar Gasto' : 'Registrar Gasto'}</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ description, amount: parseCurrency(amount), date, category }) }} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label><input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto ($)</label><input type="text" inputMode="decimal" required value={amount} onChange={e => setAmount(formatCurrency(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label><input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none">{['General', 'Transporte', 'Alojamiento', 'Comida', 'Actividades', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary-light">Guardar</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Event Modal ───
function EventModal({ show, onClose, onSubmit, edit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [cost, setCost] = useState('')
  useEffect(() => {
    if (edit) { setTitle(edit.title || ''); setDescription(edit.description || ''); setDate(edit.date || ''); setTime(edit.time || ''); setLocation(edit.location || ''); setCost(formatCurrency(String(edit.cost != null ? edit.cost : 0))) }
    else { setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setCost('') }
  }, [edit, show])
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">{edit ? 'Editar Evento' : 'Nuevo Evento'}</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ title, description, date: date || null, time, location, cost: parseCurrency(cost) || 0 }) }} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label><input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lugar</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo ($)</label><input type="text" inputMode="decimal" value={cost} onChange={e => setCost(formatCurrency(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 outline-none" /></div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-primary-light">Guardar</button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatCurrency(v) {
  const c = v.replace(/[^\d,]/g, ''); const p = c.split(',')
  if (p.length > 2) return v
  const i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return p.length === 2 ? `${i},${p[1]}` : i
}
function parseCurrency(v) { return parseFloat(v.replace(/\./g, '').replace(',', '.')) }

function formatCost(n) { try { return Number(n).toLocaleString('es-CO') } catch { return '0' } }

// ─── MAIN ADMIN ───
export default function Admin({ isAdmin }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('familias')

  const [families, setFamilies] = useState([])
  const [people, setPeople] = useState([])
  const [payments, setPayments] = useState([])
  const [paymentRounds, setPaymentRounds] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(null)
  const [events, setEvents] = useState([])
  const [info, setInfo] = useState({})

  // expanded families (by id)
  const [expanded, setExpanded] = useState({})
  // inline add person name
  const [newPersonName, setNewPersonName] = useState({})

  // payment rounds
  const [expandedRound, setExpandedRound] = useState({})
  const [roundDetails, setRoundDetails] = useState({})
  const [newRound, setNewRound] = useState({ concept: '', amount_per_person: '', date: new Date().toISOString().split('T')[0] })
  const [editAmount, setEditAmount] = useState(null)
  const [editAmountInput, setEditAmountInput] = useState('')
  const [abonoForm, setAbonoForm] = useState(null)
  const [abonoData, setAbonoData] = useState({ person_id: '', amount: '', description: '' })
  const [collapsedFamilyInRound, setCollapsedFamilyInRound] = useState({})

  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [editFamily, setEditFamily] = useState(null)
  const [showEditPerson, setShowEditPerson] = useState(false)
  const [editPerson, setEditPerson] = useState(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return }
    loadAll()
  }, [isAdmin])

  const loadAll = () => {
    api.getFamilies().then(setFamilies).catch(() => {})
    api.getPeople().then(setPeople).catch(() => {})
    api.getPayments().then(setPayments).catch(() => {})
    api.getPaymentRounds().then(setPaymentRounds).catch(() => {})
    api.getExpenses().then(setExpenses).catch(() => {})
    api.getBudget().then(setBudget).catch(() => {})
    api.getEvents().then(setEvents).catch(() => {})
    api.getTripInfo().then(setInfo).catch(() => {})
  }

  if (!isAdmin) return null

  const handleFamilySubmit = async (data) => {
    if (editFamily) await api.updateFamily(editFamily.id, data)
    else await api.createFamily(data)
    setShowFamilyModal(false); setEditFamily(null); loadAll()
  }
  const handleDeleteFamily = async (id) => {
    if (confirm('¿Eliminar esta familia?')) { await api.deleteFamily(id); loadAll() }
  }
  const handleAddMember = async (familyId) => {
    const name = newPersonName[familyId]?.trim()
    if (!name) return
    await api.createPerson({ name, family_id: familyId })
    setNewPersonName(prev => ({ ...prev, [familyId]: '' }))
    loadAll()
  }
  const handleEditPerson = async (name) => {
    if (editPerson) { await api.updatePerson(editPerson.id, { name, family_id: editPerson.family_id }); setShowEditPerson(false); setEditPerson(null); loadAll() }
  }
  const handleDeletePerson = async (id) => {
    if (confirm('¿Eliminar esta persona?')) { await api.deletePerson(id); loadAll() }
  }
  const handleCreateRound = async (e) => {
    e.preventDefault()
    if (!newRound.concept || !newRound.amount_per_person) return
    await api.createPaymentRound({ concept: newRound.concept, amount_per_person: parseCurrency(newRound.amount_per_person), date: newRound.date })
    setNewRound({ concept: '', amount_per_person: '', date: new Date().toISOString().split('T')[0] })
    loadAll()
  }
  const handleDeleteRound = async (id) => {
    if (confirm('¿Eliminar esta ronda de pago? Se borrarán todos los pagos asociados.')) { await api.deletePaymentRound(id); loadAll() }
  }
  const handleToggleRoundPayment = async (roundId, personId, amount, personName) => {
    const detail = roundDetails[roundId]
    const existing = detail?.people?.find(p => p.id === personId)?.payment_id
    if (existing) {
      if (!confirm(`¿Quitar el pago de ${personName}? Se va a marcar como pendiente.`)) return
      await api.deleteRoundPayment(roundId, personId)
    } else {
      await api.createPayment({ person_id: personId, amount, date: new Date().toISOString().split('T')[0], description: detail.round.concept, round_id: roundId })
    }
    // reload detail + rounds
    const d = await api.getPaymentRoundDetail(roundId)
    setRoundDetails(prev => ({ ...prev, [roundId]: d }))
    loadAll()
  }
  const loadRoundDetail = async (id) => {
    if (roundDetails[id]) return
    const d = await api.getPaymentRoundDetail(id)
    setRoundDetails(prev => ({ ...prev, [id]: d }))
  }
  const handleSaveAmount = async (roundId, personId) => {
    const detail = roundDetails[roundId]
    const existing = detail?.people?.find(p => p.id === personId)?.payment_id
    const amount = parseCurrency(editAmountInput)
    if (!amount || amount <= 0) return
    if (existing) {
      await api.updatePayment(existing, { person_id: personId, amount, date: new Date().toISOString().split('T')[0], description: detail.round.concept, round_id: roundId })
    } else {
      await api.createPayment({ person_id: personId, amount, date: new Date().toISOString().split('T')[0], description: detail.round.concept, round_id: roundId })
    }
    setEditAmount(null)
    const d = await api.getPaymentRoundDetail(roundId)
    setRoundDetails(prev => ({ ...prev, [roundId]: d }))
    loadAll()
  }
  const handleAbonoSubmit = async (roundId) => {
    if (!abonoData.person_id || !abonoData.amount) return
    await api.createPayment({ person_id: Number(abonoData.person_id), amount: parseCurrency(abonoData.amount), date: new Date().toISOString().split('T')[0], description: abonoData.description || 'Abono extra', round_id: roundId })
    setAbonoForm(null)
    setAbonoData({ person_id: '', amount: '', description: '' })
    const d = await api.getPaymentRoundDetail(roundId)
    setRoundDetails(prev => ({ ...prev, [roundId]: d }))
    loadAll()
  }
  const handleExpenseSubmit = async (data) => {
    if (editExpense) await api.updateExpense(editExpense.id, data)
    else await api.createExpense(data)
    setShowExpenseModal(false); setEditExpense(null); loadAll()
  }
  const handleDeleteExpense = async (id) => {
    if (confirm('¿Eliminar este gasto?')) { await api.deleteExpense(id); loadAll() }
  }
  const handleEventSubmit = async (data) => {
    if (editEvent) await api.updateEvent(editEvent.id, data)
    else await api.createEvent(data)
    setShowEventModal(false); setEditEvent(null); loadAll()
  }
  const handleDeleteEvent = async (id) => {
    if (confirm('¿Eliminar este evento?')) { await api.deleteEvent(id); loadAll() }
  }
  const handleChangePassword = async () => {
    if (!password.trim()) return
    await api.updateTripInfo('admin_password', password)
    alert('Contraseña actualizada'); setPassword('')
  }
  const handleUpdateInfo = async (key, value) => {
    await api.updateTripInfo(key, value)
    setInfo(prev => ({ ...prev, [key]: value }))
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const costenoMessage = (round) => {
    const msgs = {
      done: [
        '¡Ay ombe! To\' el mundo al día. ¡Eso e\' como pa\' alegrá el alma! 🎉',
        '¡Eso e\'! To\'s pagaron. Coveñas nos espera con los brazos abiertos. 🏖️',
        '¡A la berraca! Esto e\' un family de verdad. 10/10 pagaos. 👏',
        '¡Uy papa! Con to\'s al día, la playa va a estar buena. 🌊',
      ],
      half: [
        'Van {done} pagado(s) y {pending} debe\'ando. ¡Los morosos ponte las pilas que la playa no espera! 🔔',
        'Mijo, la cuenta no se paga solita. Apretá el culo y pagá. 😅',
        'Casi, casi... pero todavía falta. ¡No sea\' pollo y pagá! 🐔',
        'El agua\'e la playa e\' salá, pero los pagos atrasados son más salados todavía. 🧂',
      ],
      none: [
        '¡A la verga! To\' el mundo debe. ¿Esto e\' un viaje o una nova? 😂',
        'Esto ta más seco que el desierto de la Tatacoa. ¡Aflojen la billetera! 🏜️',
        'Cero pesos, cero pagos. ¡Ni pa\' un bus a Coveñas! 🚌',
        'Si esto sigue así, nos vemos en el mapalé en El Copey. 💃',
      ],
      oneLeft: [
        '¡Solo falta {pending}! ¡Dale gasolina, que el plan e\' por allá arriba! ⛽',
        'Un@ quedó debe\'ando. Ya casi, ya casi... ¡No lo dejemo\' plantado! 🪴',
      ],
    }
    const pct = round.total_expected > 0 ? round.paid_count / (round.total_expected / round.amount_per_person) : 0
    const opts = pct >= 1 ? msgs.done : pct > 0.5 ? msgs.half : msgs.none
    if (round.pending_count === 1 && pct > 0) opts.push(...msgs.oneLeft)
    const msg = opts[Math.floor(Math.random() * opts.length)]
    return msg.replace('{done}', round.paid_count).replace('{pending}', round.pending_count)
  }

  const tabs = [
    { id: 'familias', label: '🏠 Familias' },
    { id: 'pagos', label: '💰 Pagos' },
    { id: 'gastos', label: '🎯 Metas' },
    { id: 'eventos', label: '🎉 Eventos' },
    { id: 'presupuesto', label: '📈 Aporte' },
    { id: 'viaje', label: '✏️ Info' },
    { id: 'password', label: '🔑' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">🔧 Panel de Administración</h2>

      <div className="flex gap-1 flex-wrap bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═════ FAMILIAS ═════ */}
      {tab === 'familias' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Familias ({families.length})</h3>
            <button onClick={() => { setEditFamily(null); setShowFamilyModal(true) }}
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-light">+ Nueva</button>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {families.map(f => {
              const members = people.filter(p => p.family_id === f.id)
              const head = members.find(m => m.is_head)
              const others = members.filter(m => !m.is_head)
              const isOpen = expanded[f.id]
              const inputName = newPersonName[f.id] || ''

              return (
                <div key={f.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                  {/* Family header */}
                  <div className="px-4 py-3 flex flex-col gap-2" style={{ backgroundColor: f.color }}>
                    <div className="flex items-center gap-2 text-white">
                      <button onClick={() => toggleExpand(f.id)} className="text-lg hover:scale-110 transition-transform shrink-0">
                        {isOpen ? '▼' : '▶'}
                      </button>
                      <span className="font-bold truncate">{f.name}</span>
                      <span className="font-normal text-white/80 text-xs shrink-0">({members.length})</span>
                      <div className="ml-auto flex gap-1 text-xs">
                        <button onClick={() => { setEditFamily(f); setShowFamilyModal(true) }} className="hover:underline bg-white/20 px-2 py-0.5 rounded">Editar</button>
                        <button onClick={() => handleDeleteFamily(f.id)} className="hover:underline bg-white/20 px-2 py-0.5 rounded">Eliminar</button>
                      </div>
                    </div>
                    {f.head_name && !isOpen && (
                      <div className="text-xs text-white/90 truncate">👑 {f.head_name}</div>
                    )}
                  </div>

                  {/* Members section (collapsible) */}
                  {isOpen && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 flex-1 overflow-y-auto max-h-64">
                      {head && (
                        <div className="px-4 py-2 flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">👑</span>
                            <span className="font-medium text-sm dark:text-gray-200 truncate">{head.name}</span>
                            <span className="text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded font-medium shrink-0">Cabeza</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">${(head.total_paid || 0).toLocaleString('es-CO')}</span>
                            <button onClick={() => { setEditPerson(head); setShowEditPerson(true) }} className="text-xs text-primary-light hover:underline">✎</button>
                            <button onClick={() => handleDeletePerson(head.id)} className="text-xs text-red-400 hover:underline">🗑</button>
                          </div>
                        </div>
                      )}
                      {others.map(p => (
                        <div key={p.id} className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <span className="text-sm dark:text-gray-200 truncate">{p.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">${(p.total_paid || 0).toLocaleString('es-CO')}</span>
                            <button onClick={() => { setEditPerson(p); setShowEditPerson(true) }} className="text-xs text-primary-light hover:underline">✎</button>
                            <button onClick={() => handleDeletePerson(p.id)} className="text-xs text-red-400 hover:underline">🗑</button>
                          </div>
                        </div>
                      ))}

                      {/* Inline add form */}
                      <div className="px-4 py-2 flex gap-2 items-center bg-gray-50 dark:bg-gray-700/50">
                        <input
                          type="text"
                          placeholder="Nombre..."
                          value={inputName}
                          onChange={e => setNewPersonName(prev => ({ ...prev, [f.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(f.id) } }}
                          className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-light outline-none"
                        />
                        <button onClick={() => handleAddMember(f.id)}
                          className="bg-primary text-white px-2 py-1 rounded-lg text-xs hover:bg-primary-light shrink-0">+</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <FamilyModal show={showFamilyModal} onClose={() => { setShowFamilyModal(false); setEditFamily(null) }}
            onSubmit={handleFamilySubmit} edit={editFamily}
            familyMembers={editFamily ? people.filter(p => p.family_id === editFamily.id) : []} />

          <EditPersonModal show={showEditPerson} onClose={() => { setShowEditPerson(false); setEditPerson(null) }}
            onSubmit={handleEditPerson} edit={editPerson} />
        </div>
      )}

      {/* ═════ PAGOS ═════ */}
      {tab === 'pagos' && (
        <div className="space-y-4">
          {/* Create round form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">+ Nueva ronda de cobro</h3>
            <form onSubmit={handleCreateRound} className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Concepto</label>
                <input type="text" required value={newRound.concept} onChange={e => setNewRound(p => ({ ...p, concept: e.target.value }))} placeholder="Ej: Cuota Julio"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none" />
              </div>
              <div className="w-[140px]">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Valor c/u ($)</label>
                <input type="text" inputMode="decimal" required value={newRound.amount_per_person} onChange={e => setNewRound(p => ({ ...p, amount_per_person: formatCurrency(e.target.value) }))} placeholder="10.000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none" />
              </div>
              <div className="w-[140px]">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
                <input type="date" required value={newRound.date} onChange={e => setNewRound(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none" />
              </div>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light h-[38px]">Crear ronda</button>
            </form>
          </div>

          {/* Round cards */}
          {[...paymentRounds].sort((a, b) => {
            const aDone = a.pending_count === 0 ? 1 : 0
            const bDone = b.pending_count === 0 ? 1 : 0
            if (aDone !== bDone) return aDone - bDone
            return new Date(b.date) - new Date(a.date)
          }).map(r => {
            const pct = r.total_expected > 0 ? Math.round((r.total_paid / r.total_expected) * 100) : 0
            const isOpen = expandedRound[r.id]
            const detail = roundDetails[r.id]

            return (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-primary to-primary-light text-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => { setExpandedRound(p => ({ ...p, [r.id]: !p[r.id] })); if (!roundDetails[r.id]) loadRoundDetail(r.id) }} className="text-lg hover:scale-110 shrink-0">
                      {isOpen ? '▼' : '▶'}
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{r.concept}</p>
                      <p className="text-xs text-white/80">{new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteRound(r.id)} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 shrink-0 ml-2">🗑</button>
                </div>

                {/* Progress & summary */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{r.paid_count} de {(r.total_expected / r.amount_per_person).toFixed(0)} personas</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">${r.total_paid.toLocaleString('es-CO')} / ${r.total_expected.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                  <p className="text-xs italic text-gray-500 dark:text-gray-400">{costenoMessage(r)}</p>
                </div>

                {/* Detail (loaded on expand) */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <p className="px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
                      <span>Haz clic en Pendiente para pagar · ✎ para editar monto</span>
                    </p>
                    <div className="max-h-80 overflow-y-auto">
                      {!detail && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">Cargando...</div>
                      )}
                      {detail && (() => {
                        const grouped = {}
                        detail.people.forEach(p => {
                          const key = p.family_name || 'Sin familia'
                          if (!grouped[key]) grouped[key] = { color: p.family_color || '#9CA3AF', members: [] }
                          grouped[key].members.push(p)
                        })
                        return Object.entries(grouped).map(([familyName, group]) => {
                          const famPaid = group.members.filter(m => m.payment_id).length
                          const famTotal = group.members.reduce((s, m) => s + (m.paid_amount || 0), 0)
                          const allFullyPaid = group.members.every(m => m.payment_count > 0 && m.paid_amount >= r.amount_per_person)
                          const famKey = `${r.id}-${familyName}`
                          const isFamCollapsed = collapsedFamilyInRound[famKey] ?? allFullyPaid
                          return (
                            <div key={familyName} className={`border-b border-gray-100 dark:border-gray-700 last:border-0 ${allFullyPaid ? 'opacity-70' : ''}`}>
                              <div className="px-4 py-1.5 flex items-center justify-between text-xs font-semibold bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 sticky top-0 cursor-pointer select-none"
                                onClick={() => setCollapsedFamilyInRound(p => ({ ...p, [famKey]: !isFamCollapsed }))}>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base">{isFamCollapsed ? '▶' : '▼'}</span>
                                  <span style={{ color: group.color }}>●</span>
                                  <span>{familyName}</span>
                                  <span className="font-normal text-gray-400">({famPaid}/{group.members.length})</span>
                                  {allFullyPaid && <span className="text-green-600 dark:text-green-400 text-xs ml-1">✅</span>}
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <span>${famTotal.toLocaleString('es-CO')}</span>
                                  <button onClick={() => { setAbonoForm(r.id); setAbonoData({ person_id: '', amount: '', description: '' }) }}
                                    className="text-primary-light hover:underline text-xs">+ Abono</button>
                                </div>
                              </div>
                              {!isFamCollapsed && (
                              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {group.members.map(p => {
                                  const hasPayment = p.payment_count > 0
                                  const fullyPaid = hasPayment && p.paid_amount >= r.amount_per_person
                                  const editing = editAmount?.roundId === r.id && editAmount?.personId === p.id
                                  return (
                                    <div key={p.id} className={`px-4 py-2 flex items-center justify-between ${hasPayment ? 'bg-green-50/50 dark:bg-green-900/5' : ''}`}>
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-base ${hasPayment ? '' : 'opacity-30'}`} style={{ color: group.color }}>●</span>
                                        <span className={`text-sm truncate ${fullyPaid ? 'dark:text-gray-400 line-through' : 'dark:text-gray-200 font-medium'}`}>{p.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {hasPayment && !editing && (
                                          <>
                                            <span className={`text-xs font-semibold ${fullyPaid ? 'text-green-600' : 'text-yellow-600 dark:text-yellow-400'}`}>${(p.paid_amount || 0).toLocaleString('es-CO')}${fullyPaid ? '' : '/' + r.amount_per_person.toLocaleString('es-CO')}</span>
                                            <button onClick={() => { setEditAmount({ roundId: r.id, personId: p.id }); setEditAmountInput(formatCurrency(String(p.paid_amount || r.amount_per_person))) }}
                                              className="text-xs text-primary-light hover:underline">✎</button>
                                          </>
                                        )}
                                        {editing && (
                                          <form onSubmit={e => { e.preventDefault(); handleSaveAmount(r.id, p.id) }} className="flex items-center gap-1">
                                            <input type="text" inputMode="decimal" value={editAmountInput} onChange={e => setEditAmountInput(formatCurrency(e.target.value))}
                                              autoFocus className="w-20 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:ring-2 outline-none" />
                                            <button type="submit" className="text-xs text-green-600 hover:underline font-medium">OK</button>
                                            <button type="button" onClick={() => setEditAmount(null)} className="text-xs text-gray-400 hover:underline">✕</button>
                                          </form>
                                        )}
                                        {!hasPayment && !editing && (
                                          <button onClick={() => { setEditAmount({ roundId: r.id, personId: p.id }); setEditAmountInput(formatCurrency(String(r.amount_per_person))) }}
                                            className="text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-2 py-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
                                            ⏳ ${r.amount_per_person.toLocaleString('es-CO')}
                                          </button>
                                        )}
                                        {hasPayment && !editing && (
                                          <button onClick={() => handleToggleRoundPayment(r.id, p.id, r.amount_per_person, p.name)}
                                            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${fullyPaid ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700' : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700'}`}>
                                            {fullyPaid ? '✅ Pagó' : `💰 Abonó`}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                              )}
                              {/* Abono form for this family */}
                              {abonoForm === r.id && (
                                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-t border-gray-100 dark:border-gray-700">
                                  <form onSubmit={e => { e.preventDefault(); handleAbonoSubmit(r.id) }} className="flex flex-wrap gap-2 items-center">
                                    <select required value={abonoData.person_id} onChange={e => setAbonoData(p => ({ ...p, person_id: e.target.value }))}
                                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded">
                                      <option value="">Persona...</option>
                                      {detail.people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.family_name})</option>)}
                                    </select>
                                    <input type="text" inputMode="decimal" required placeholder="Monto" value={abonoData.amount} onChange={e => setAbonoData(p => ({ ...p, amount: formatCurrency(e.target.value) }))}
                                      className="w-24 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded" />
                                    <input type="text" placeholder="Concepto" value={abonoData.description} onChange={e => setAbonoData(p => ({ ...p, description: e.target.value }))}
                                      className="flex-1 min-w-[100px] text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded" />
                                    <button type="submit" className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-light">Agregar</button>
                                    <button type="button" onClick={() => setAbonoForm(null)} className="text-xs text-gray-400 hover:underline">✕</button>
                                  </form>
                                </div>
                              )}
                            </div>
                          )
                        })
                      })()}
                      {detail?.people?.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">Sin personas registradas</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {paymentRounds.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No hay rondas de cobro. ¡Crea la primera!</p>
          )}
        </div>
      )}

      {/* ═════ GASTOS ═════ */}
      {tab === 'gastos' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Gastos estimados ({expenses.length})</h3>
            <button onClick={() => { setEditExpense(null); setShowExpenseModal(true) }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-light">+ Registrar</button>
          </div>

          {(() => {
            const grouped = {}
            expenses.forEach(e => {
              if (!grouped[e.category]) grouped[e.category] = []
              grouped[e.category].push(e)
            })
            return Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-200 flex justify-between items-center">
                  <span>{cat}</span>
                  <span className="text-red-500 dark:text-red-400 font-bold">${items.reduce((s, e) => s + e.amount, 0).toLocaleString('es-CO')}</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map(e => (
                    <div key={e.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium dark:text-gray-200 truncate">{e.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(e.date).toLocaleDateString('es-CO')}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-sm font-semibold text-red-500 dark:text-red-400">${e.amount.toLocaleString('es-CO')}</span>
                        <button onClick={() => { setEditExpense(e); setShowExpenseModal(true) }} className="text-xs text-primary-light hover:underline">✎</button>
                        <button onClick={() => handleDeleteExpense(e.id)} className="text-xs text-red-400 hover:underline">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}

          {expenses.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No hay gastos registrados</p>
          )}

          <ExpenseModal show={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditExpense(null) }} onSubmit={handleExpenseSubmit} edit={editExpense} />
        </div>
      )}

      {/* ═════ EVENTOS ═════ */}
      {tab === 'eventos' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Eventos ({events.length})</h3>
            <button onClick={() => { setEditEvent(null); setShowEventModal(true) }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-light">+ Nuevo</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map(ev => (
              <div key={ev.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-primary dark:text-primary-light">{ev.title}</h4>
                  <div className="flex gap-2 text-xs shrink-0">
                    <button onClick={() => { setEditEvent(ev); setShowEventModal(true) }} className="text-primary-light hover:underline">Editar</button>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:underline">Eliminar</button>
                  </div>
                </div>
                {ev.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {ev.date && <span>📅 {new Date(ev.date).toLocaleDateString('es-CO')}</span>}
                  {ev.time && <span>⏰ {ev.time}</span>}
                  {ev.location && <span>📍 {ev.location}</span>}
                  {ev.cost > 0 && <span>💰 ${formatCost(ev.cost)}</span>}
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm col-span-2 text-center py-8">No hay eventos</p>}
          </div>
          <EventModal show={showEventModal} onClose={() => { setShowEventModal(false); setEditEvent(null) }} onSubmit={handleEventSubmit} edit={editEvent} />
        </div>
      )}

      {/* ═════ PRESUPUESTO / METAS ═════ */}
      {tab === 'presupuesto' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Metas de Presupuesto</h3>
            <button onClick={() => {
              const name = prompt('Nombre de la meta (ej: Hospedaje):')
              if (!name) return
              const goal = prompt('Meta total ($):')
              if (!goal) return
              api.createBudgetCategory({ name, goal: parseCurrency(goal) }).then(() => loadAll())
            }} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-light">+ Meta</button>
          </div>

          {budget && (
            <>
              {/* Global progress */}
              {budget.totalGoal > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm dark:text-gray-200">Total presupuesto</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${budget.totalCollected.toLocaleString('es-CO')} / ${budget.totalGoal.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${Math.min((budget.totalCollected / budget.totalGoal) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {budget.people.length} personas · ${(budget.totalGoal / Math.max(budget.people.length, 1)).toLocaleString('es-CO')} c/u
                    {budget.people.length > 0 && ` · Meta personal: $${(budget.totalGoal / budget.people.length).toLocaleString('es-CO')}`}
                  </p>
                </div>
              )}

              {/* Categories */}
              <div className="grid gap-3 sm:grid-cols-2">
                {budget.categories.map(cat => {
                  const pct = cat.goal > 0 ? Math.round((cat.collected / cat.goal) * 100) : 0
                  return (
                    <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-sm dark:text-gray-200">{cat.name}</h4>
                          <p className="text-xs text-gray-400">${cat.goal.toLocaleString('es-CO')} meta</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {
                            const g = prompt('Nueva meta ($):', String(cat.goal))
                            if (g) api.updateBudgetCategory(cat.id, { name: cat.name, goal: parseCurrency(g) }).then(() => loadAll())
                          }} className="text-xs text-primary-light hover:underline">✎</button>
                          <button onClick={() => { if (confirm('¿Eliminar esta meta?')) api.deleteBudgetCategory(cat.id).then(() => loadAll()) }} className="text-xs text-red-400 hover:underline">🗑</button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-1">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{pct}%</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">${cat.collected.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* General abono form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-sm dark:text-gray-200 mb-3">➕ Abono general</h4>
                <p className="text-xs text-gray-400 mb-2">Registrar un aporte extra de una persona, no asociado a una ronda</p>
                <form onSubmit={async e => {
                  e.preventDefault(); const fd = new FormData(e.target)
                  await api.createAbono({ person_id: Number(fd.get('person_id')), amount: parseCurrency(fd.get('amount')), description: fd.get('description') || 'Abono general' })
                  loadAll(); e.target.reset()
                }} className="flex flex-wrap gap-2 items-end">
                  <select name="person_id" required className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none">
                    <option value="">Persona...</option>
                    {budget.people.map(p => <option key={p.id} value={p.id}>{p.name} ({p.family_name || 'Sin fam'})</option>)}
                  </select>
                  <input name="amount" type="text" inputMode="decimal" required placeholder="Monto" className="w-28 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none" />
                  <input name="description" type="text" placeholder="Concepto (opcional)" className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none" />
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light">Agregar</button>
                </form>
              </div>

              {/* Per-person breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-200">
                  Aportes por persona
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                  {budget.people.map(p => {
                    const perPersonGoal = budget.totalGoal / Math.max(budget.people.length, 1)
                    const pct = perPersonGoal > 0 ? Math.round((p.total_paid / perPersonGoal) * 100) : 0
                    return (
                      <div key={p.id} className="px-4 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate dark:text-gray-200">{p.name}</span>
                            {p.family_name && <span className="text-xs text-gray-400">({p.family_name})</span>}
                          </div>
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0 ml-2">
                            ${p.total_paid.toLocaleString('es-CO')} / ${perPersonGoal.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═════ INFO VIAJE ═════ */}
      {tab === 'viaje' && (
        <div className="max-w-lg space-y-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Información del Viaje</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
            {[
              { key: 'trip_name', label: 'Nombre' },
              { key: 'trip_origin', label: 'Origen' },
              { key: 'trip_destination', label: 'Destino' },
              { key: 'trip_date_start', label: 'Fecha inicio' },
              { key: 'trip_date_end', label: 'Fecha fin' },
              { key: 'trip_description', label: 'Descripción' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue={info[field.key] || ''}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 outline-none" id={`info-${field.key}`} />
                  <button onClick={() => { const val = document.getElementById(`info-${field.key}`).value; handleUpdateInfo(field.key, val) }}
                    className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-light">Guardar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════ PASSWORD ═════ */}
      {tab === 'password' && (
        <div className="max-w-md">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Cambiar Contraseña</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 outline-none" placeholder="Nueva contraseña" />
              <button onClick={handleChangePassword} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-light">Cambiar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
