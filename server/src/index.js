const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
  if (token !== (settings ? settings.value : 'admin123')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// ─── TRIP INFO ───
app.get('/api/trip-info', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM trip_info').all();
  const settings = db.prepare('SELECT key, value FROM settings WHERE key LIKE ?').all('trip_%');
  const info = {};
  [...rows, ...settings].forEach(r => info[r.key] = r.value);
  if (!info.trip_name) info.trip_name = 'Viaje a Coveñas 2027';
  if (!info.trip_origin) info.trip_origin = 'El Copey, Cesar';
  if (!info.trip_destination) info.trip_destination = 'Coveñas, Sucre';
  if (!info.trip_date_start) info.trip_date_start = '2027-01-02';
  if (!info.trip_date_end) info.trip_date_end = '2027-01-07';
  res.json(info);
});

app.put('/api/trip-info', requireAdmin, (req, res) => {
  const { key, value } = req.body;
  if (key === 'admin_password') {
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(value, key);
  } else {
    db.prepare('INSERT OR REPLACE INTO trip_info (key, value) VALUES (?, ?)').run(key, value);
  }
  res.json({ success: true });
});

// ─── AUTH ───
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const stored = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
  if (password === (stored ? stored.value : 'admin123')) {
    res.json({ success: true, token: stored ? stored.value : 'admin123' });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

// ─── FAMILIES ───
app.get('/api/families', (req, res) => {
  const families = db.prepare(`
    SELECT f.*, p.name as head_name
    FROM families f
    LEFT JOIN people p ON f.head_id = p.id
    ORDER BY f.name
  `).all();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM people WHERE family_id = ?');
  families.forEach(f => {
    f.member_count = stmt.get(f.id).count;
  });
  res.json(families);
});

app.post('/api/families', requireAdmin, (req, res) => {
  const { name, color, head_id } = req.body;
  const result = db.prepare('INSERT INTO families (name, color, head_id) VALUES (?, ?, ?)').run(name, color || '#3B82F6', head_id || null);
  res.json({ id: result.lastInsertRowid, name, color, head_id: head_id || null });
});

app.put('/api/families/:id', requireAdmin, (req, res) => {
  const { name, color, head_id } = req.body;
  db.prepare('UPDATE families SET name = ?, color = ?, head_id = ? WHERE id = ?').run(name, color, head_id || null, req.params.id);
  res.json({ success: true });
});

app.delete('/api/families/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE people SET family_id = NULL WHERE family_id = ?').run(req.params.id);
  db.prepare('DELETE FROM families WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── PEOPLE ───
app.get('/api/people', (req, res) => {
  const people = db.prepare(`
    SELECT p.*, f.name as family_name, f.color as family_color, f.head_id
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    ORDER BY f.name, p.name
  `).all();
  const paymentStmt = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE person_id = ?');
  people.forEach(p => {
    p.total_paid = paymentStmt.get(p.id).total;
    p.is_head = p.head_id === p.id;
  });
  res.json(people);
});

app.post('/api/people', requireAdmin, (req, res) => {
  const { name, family_id, phone } = req.body;
  const result = db.prepare('INSERT INTO people (name, family_id, phone) VALUES (?, ?, ?)').run(name, family_id || null, phone || '');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/people/:id', requireAdmin, (req, res) => {
  const { name, family_id, phone } = req.body;
  db.prepare('UPDATE people SET name = ?, family_id = ?, phone = ? WHERE id = ?').run(name, family_id || null, phone || '', req.params.id);
  res.json({ success: true });
});

app.delete('/api/people/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── PAYMENT ROUNDS ───
app.get('/api/payment-rounds', (req, res) => {
  const rounds = db.prepare('SELECT * FROM payment_rounds ORDER BY date DESC, created_at DESC').all();
  const peopleCount = db.prepare('SELECT COUNT(*) as c FROM people').get().c;
  rounds.forEach(r => {
    const paid = db.prepare('SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as total FROM payments WHERE round_id = ?').get(r.id);
    r.paid_count = paid.c;
    r.total_paid = paid.total;
    r.total_expected = peopleCount * r.amount_per_person;
    r.pending_count = peopleCount - paid.c;
  });
  res.json(rounds);
});

app.post('/api/payment-rounds', requireAdmin, (req, res) => {
  const { concept, amount_per_person, date } = req.body;
  const result = db.prepare('INSERT INTO payment_rounds (concept, amount_per_person, date) VALUES (?, ?, ?)').run(concept, amount_per_person, date);
  res.json({ id: result.lastInsertRowid, concept, amount_per_person, date });
});

app.delete('/api/payment-rounds/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM payments WHERE round_id = ?').run(req.params.id);
  db.prepare('DELETE FROM payment_rounds WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/payment-rounds/:id', (req, res) => {
  const round = db.prepare('SELECT * FROM payment_rounds WHERE id = ?').get(req.params.id);
  if (!round) return res.status(404).json({ error: 'No encontrado' });
  const people = db.prepare(`
    SELECT p.*, f.name as family_name, f.color as family_color,
           COALESCE(SUM(pa.amount), 0) as paid_amount,
           COUNT(pa.id) as payment_count,
           MAX(pa.id) as payment_id
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    LEFT JOIN payments pa ON pa.person_id = p.id AND pa.round_id = ?
    GROUP BY p.id
    ORDER BY f.name, p.name
  `).all(req.params.id);
  res.json({ round, people });
});

// ─── PAYMENTS ───
app.get('/api/payments', (req, res) => {
  const payments = db.prepare(`
    SELECT pa.*, pe.name as person_name, f.name as family_name, f.color as family_color
    FROM payments pa
    JOIN people pe ON pa.person_id = pe.id
    LEFT JOIN families f ON pe.family_id = f.id
    ORDER BY pa.date DESC, pa.created_at DESC
  `).all();
  res.json(payments);
});

app.delete('/api/payments/round/:roundId/person/:personId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM payments WHERE round_id = ? AND person_id = ?').run(req.params.roundId, req.params.personId);
  res.json({ success: true });
});

app.post('/api/payments', requireAdmin, (req, res) => {
  const { person_id, amount, date, description, round_id } = req.body;
  const result = db.prepare('INSERT INTO payments (person_id, amount, date, description, round_id) VALUES (?, ?, ?, ?, ?)')
    .run(person_id, amount, date, description || '', round_id || null);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/payments/:id', requireAdmin, (req, res) => {
  const { person_id, amount, date, description } = req.body;
  db.prepare('UPDATE payments SET person_id = ?, amount = ?, date = ?, description = ? WHERE id = ?')
    .run(person_id, amount, date, description || '', req.params.id);
  res.json({ success: true });
});

app.delete('/api/payments/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── EXPENSES ───
app.get('/api/expenses', (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all();
  res.json(expenses);
});

app.post('/api/expenses', requireAdmin, (req, res) => {
  const { description, amount, date, category } = req.body;
  const result = db.prepare('INSERT INTO expenses (description, amount, date, category) VALUES (?, ?, ?, ?)')
    .run(description, amount, date, category || 'General');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/expenses/:id', requireAdmin, (req, res) => {
  const { description, amount, date, category } = req.body;
  db.prepare('UPDATE expenses SET description = ?, amount = ?, date = ?, category = ? WHERE id = ?')
    .run(description, amount, date, category || 'General', req.params.id);
  res.json({ success: true });
});

app.delete('/api/expenses/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── EVENTS ───
app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY date ASC, time ASC').all();
  res.json(events);
});

app.post('/api/events', requireAdmin, (req, res) => {
  const { title, description, date, time, location, cost } = req.body;
  const result = db.prepare('INSERT INTO events (title, description, date, time, location, cost) VALUES (?, ?, ?, ?, ?, ?)')
    .run(title, description || '', date || null, time || '', location || '', cost || 0);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/events/:id', requireAdmin, (req, res) => {
  const { title, description, date, time, location, cost } = req.body;
  db.prepare('UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, cost = ? WHERE id = ?')
    .run(title, description || '', date || null, time || '', location || '', cost || 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/events/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── DASHBOARD STATS ───
app.get('/api/dashboard', (req, res) => {
  const totalPeople = db.prepare('SELECT COUNT(*) as count FROM people').get().count;
  const totalFamilies = db.prepare('SELECT COUNT(*) as count FROM families').get().count;
  const totalPayments = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments').get().total;
  const totalExpenses = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get().total;
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  const balance = totalPayments - totalExpenses;
  const recentPayments = db.prepare(`
    SELECT pa.*, pe.name as person_name
    FROM payments pa
    JOIN people pe ON pa.person_id = pe.id
    ORDER BY pa.created_at DESC LIMIT 5
  `).all();
  const upcomingEvents = db.prepare(`
    SELECT * FROM events WHERE date >= date('now') OR date IS NULL
    ORDER BY date ASC LIMIT 5
  `).all();

  res.json({
    totalPeople,
    totalFamilies,
    totalPayments,
    totalExpenses,
    totalEvents,
    balance,
    recentPayments,
    upcomingEvents
  });
});

// ─── HISTORY ───
app.get('/api/history', (req, res) => {
  const { family, month, type } = req.query

  let payments = db.prepare(`
    SELECT p.id, p.amount, p.date, p.description, p.created_at,
           pe.name as person_name, pe.family_id, f.name as family_name, f.color as family_color,
           'pago' as tipo, pr.concept as round_concept
    FROM payments p
    JOIN people pe ON p.person_id = pe.id
    LEFT JOIN families f ON pe.family_id = f.id
    LEFT JOIN payment_rounds pr ON p.round_id = pr.id
  `).all()

  let expenses = db.prepare(`
    SELECT e.id, e.amount, e.date, e.description, e.created_at,
           NULL as person_name, NULL as family_id, NULL as family_name, NULL as family_color,
           'gasto' as tipo, e.category as round_concept
    FROM expenses e
  `).all()

  let all = [...payments, ...expenses]

  if (family && family !== 'todas') {
    all = all.filter(t => {
      if (t.tipo === 'pago') return String(t.family_id) === family
      return false
    })
  }

  if (month) {
    all = all.filter(t => {
      const d = new Date(t.date)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return ym === month
    })
  }

  if (type && type !== 'todos') {
    all = all.filter(t => t.tipo === type)
  }

  all.sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at))

  const totalIngresos = all.filter(t => t.tipo === 'pago').reduce((s, p) => s + p.amount, 0)
  const totalGastos = all.filter(t => t.tipo === 'gasto').reduce((s, e) => s + e.amount, 0)

  res.json({ transactions: all, totalIngresos, totalGastos, balance: totalIngresos - totalGastos })
});

// ─── BUDGET ───
app.get('/api/budget', (req, res) => {
  const categories = db.prepare(`
    SELECT bc.*,
           COALESCE(SUM(pca.amount), 0) as collected,
           (SELECT COUNT(*) FROM people) as people_count
    FROM budget_categories bc
    LEFT JOIN person_category_alloc pca ON pca.category_id = bc.id
    GROUP BY bc.id
    ORDER BY bc.name
  `).all()
  const people = db.prepare(`
    SELECT p.id, p.name, f.name as family_name, f.color as family_color,
           COALESCE((SELECT SUM(amount) FROM payments WHERE person_id = p.id), 0) as total_paid
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    ORDER BY f.name, p.name
  `).all()
  const totalGoal = categories.reduce((s, c) => s + c.goal, 0)
  const totalCollected = categories.reduce((s, c) => s + c.collected, 0)
  res.json({ categories, people, totalGoal, totalCollected })
})

app.post('/api/budget/categories', requireAdmin, (req, res) => {
  const { name, goal } = req.body
  const r = db.prepare('INSERT INTO budget_categories (name, goal) VALUES (?, ?)').run(name, goal || 0)
  res.json({ id: r.lastInsertRowid, name, goal })
})

app.put('/api/budget/categories/:id', requireAdmin, (req, res) => {
  const { name, goal } = req.body
  db.prepare('UPDATE budget_categories SET name = ?, goal = ? WHERE id = ?').run(name, goal || 0, req.params.id)
  res.json({ success: true })
})

app.delete('/api/budget/categories/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM person_category_alloc WHERE category_id = ?').run(req.params.id)
  db.prepare('DELETE FROM budget_categories WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.put('/api/budget/alloc/:personId/:categoryId', requireAdmin, (req, res) => {
  const { amount } = req.body
  db.prepare(`
    INSERT INTO person_category_alloc (person_id, category_id, amount, is_manual)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(person_id, category_id) DO UPDATE SET amount = ?, is_manual = 1
  `).run(req.params.personId, req.params.categoryId, amount, amount)
  res.json({ success: true })
})

app.delete('/api/budget/alloc/:personId/:categoryId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM person_category_alloc WHERE person_id = ? AND category_id = ?').run(req.params.personId, req.params.categoryId)
  res.json({ success: true })
})

app.post('/api/abono', requireAdmin, (req, res) => {
  const { person_id, amount, date, description } = req.body
  const r = db.prepare('INSERT INTO payments (person_id, amount, date, description) VALUES (?, ?, ?, ?)').run(person_id, amount, date || new Date().toISOString().split('T')[0], description || 'Abono general')
  res.json({ id: r.lastInsertRowid, ...req.body })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
