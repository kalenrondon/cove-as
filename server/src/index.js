const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Catch unhandled promise rejections (async route errors)
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));

async function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', ['admin_password']);
  if (token !== (rows[0] ? rows[0].value : 'admin123')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// ─── TRIP INFO ───
app.get('/api/trip-info', async (req, res) => {
  const { rows: tripRows } = await pool.query('SELECT key, value FROM trip_info');
  const { rows: settingsRows } = await pool.query("SELECT key, value FROM settings WHERE key LIKE 'trip_%'");
  const info = {};
  [...tripRows, ...settingsRows].forEach(r => info[r.key] = r.value);
  if (!info.trip_name) info.trip_name = 'Viaje a Coveñas 2027';
  if (!info.trip_origin) info.trip_origin = 'El Copey, Cesar';
  if (!info.trip_destination) info.trip_destination = 'Coveñas, Sucre';
  if (!info.trip_date_start) info.trip_date_start = '2027-01-02';
  if (!info.trip_date_end) info.trip_date_end = '2027-01-07';
  res.json(info);
});

app.put('/api/trip-info', requireAdmin, async (req, res) => {
  const { key, value } = req.body;
  if (key === 'admin_password') {
    await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [value, key]);
  } else {
    await pool.query('INSERT INTO trip_info (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value]);
  }
  res.json({ success: true });
});

// ─── AUTH ───
app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', ['admin_password']);
  if (password === (rows[0] ? rows[0].value : 'admin123')) {
    res.json({ success: true, token: rows[0] ? rows[0].value : 'admin123' });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

// ─── FAMILIES ───
app.get('/api/families', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT f.*, p.name as head_name,
      (SELECT COUNT(*) FROM people WHERE family_id = f.id)::int as member_count
    FROM families f
    LEFT JOIN people p ON f.head_id = p.id
    ORDER BY f.name
  `);
  res.json(rows);
});

app.post('/api/families', requireAdmin, async (req, res) => {
  const { name, color, head_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const { rows } = await pool.query(
    'INSERT INTO families (name, color, head_id) VALUES ($1, $2, $3) RETURNING id',
    [name, color || '#3B82F6', head_id || null]
  );
  res.json({ id: rows[0].id, name, color, head_id: head_id || null });
});

app.put('/api/families/:id', requireAdmin, async (req, res) => {
  const { name, color, head_id } = req.body;
  await pool.query('UPDATE families SET name = $1, color = $2, head_id = $3 WHERE id = $4',
    [name, color, head_id || null, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/families/:id', requireAdmin, async (req, res) => {
  await pool.query('UPDATE people SET family_id = NULL WHERE family_id = $1', [req.params.id]);
  await pool.query('DELETE FROM families WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// ─── PEOPLE ───
app.get('/api/people', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*, f.name as family_name, f.color as family_color, f.head_id,
      COALESCE(SUM(pa.amount), 0) as total_paid
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    LEFT JOIN payments pa ON pa.person_id = p.id
    GROUP BY p.id, f.name, f.color, f.head_id
    ORDER BY f.name, p.name
  `);
  rows.forEach(p => { p.is_head = p.head_id === p.id });
  res.json(rows);
});

app.post('/api/people', requireAdmin, async (req, res) => {
  const { name, family_id, phone } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  const { rows } = await pool.query(
    'INSERT INTO people (name, family_id, phone) VALUES ($1, $2, $3) RETURNING id',
    [name, family_id || null, phone || '']
  );
  res.json({ id: rows[0].id, ...req.body });
});

app.put('/api/people/:id', requireAdmin, async (req, res) => {
  const { name, family_id, phone } = req.body;
  await pool.query('UPDATE people SET name = $1, family_id = $2, phone = $3 WHERE id = $4',
    [name, family_id || null, phone || '', req.params.id]);
  res.json({ success: true });
});

app.delete('/api/people/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM people WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// ─── PAYMENT ROUNDS ───
app.get('/api/payment-rounds', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT pr.*,
      COALESCE(pa.paid_count, 0)::int as paid_count,
      COALESCE(pa.total_paid, 0) as total_paid
    FROM payment_rounds pr
    LEFT JOIN (
      SELECT round_id, COUNT(*)::int as paid_count, COALESCE(SUM(amount), 0) as total_paid
      FROM payments GROUP BY round_id
    ) pa ON pa.round_id = pr.id
    ORDER BY pr.date DESC, pr.created_at DESC
  `);
  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int as c FROM people');
  const peopleCount = countRows[0].c;
  rows.forEach(r => {
    r.total_expected = peopleCount * r.amount_per_person;
    r.pending_count = peopleCount - r.paid_count;
  });
  res.json(rows);
});

app.post('/api/payment-rounds', requireAdmin, async (req, res) => {
  const { concept, amount_per_person, date } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO payment_rounds (concept, amount_per_person, date) VALUES ($1, $2, $3) RETURNING id',
    [concept, amount_per_person, date]
  );
  res.json({ id: rows[0].id, concept, amount_per_person, date });
});

app.delete('/api/payment-rounds/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM payments WHERE round_id = $1', [req.params.id]);
  await pool.query('DELETE FROM payment_rounds WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/payment-rounds/:id', async (req, res) => {
  const { rows: roundRows } = await pool.query('SELECT * FROM payment_rounds WHERE id = $1', [req.params.id]);
  if (!roundRows[0]) return res.status(404).json({ error: 'No encontrado' });
  const { rows: people } = await pool.query(`
    SELECT p.*, f.name as family_name, f.color as family_color,
      COALESCE(SUM(pa.amount), 0) as paid_amount,
      COUNT(pa.id)::int as payment_count,
      MAX(pa.id) as payment_id
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    LEFT JOIN payments pa ON pa.person_id = p.id AND pa.round_id = $1
    GROUP BY p.id, f.name, f.color
    ORDER BY f.name, p.name
  `, [req.params.id]);
  res.json({ round: roundRows[0], people });
});

// ─── PAYMENTS ───
app.get('/api/payments', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT pa.*, pe.name as person_name, f.name as family_name, f.color as family_color
    FROM payments pa
    JOIN people pe ON pa.person_id = pe.id
    LEFT JOIN families f ON pe.family_id = f.id
    ORDER BY pa.date DESC, pa.created_at DESC
  `);
  res.json(rows);
});

app.delete('/api/payments/round/:roundId/person/:personId', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM payments WHERE round_id = $1 AND person_id = $2',
    [req.params.roundId, req.params.personId]);
  res.json({ success: true });
});

app.post('/api/payments', requireAdmin, async (req, res) => {
  const { person_id, amount, date, description, round_id } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO payments (person_id, amount, date, description, round_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [person_id, amount, date, description || '', round_id || null]
  );
  res.json({ id: rows[0].id, ...req.body });
});

app.put('/api/payments/:id', requireAdmin, async (req, res) => {
  const { person_id, amount, date, description } = req.body;
  await pool.query('UPDATE payments SET person_id = $1, amount = $2, date = $3, description = $4 WHERE id = $5',
    [person_id, amount, date, description || '', req.params.id]);
  res.json({ success: true });
});

app.delete('/api/payments/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM payments WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// ─── EXPENSES ───
app.get('/api/expenses', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
  res.json(rows);
});

app.post('/api/expenses', requireAdmin, async (req, res) => {
  const { description, amount, date, category } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO expenses (description, amount, date, category) VALUES ($1, $2, $3, $4) RETURNING id',
    [description, amount, date, category || 'General']
  );
  res.json({ id: rows[0].id, ...req.body });
});

app.put('/api/expenses/:id', requireAdmin, async (req, res) => {
  const { description, amount, date, category } = req.body;
  await pool.query('UPDATE expenses SET description = $1, amount = $2, date = $3, category = $4 WHERE id = $5',
    [description, amount, date, category || 'General', req.params.id]);
  res.json({ success: true });
});

app.delete('/api/expenses/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// ─── DASHBOARD STATS ───
app.get('/api/dashboard', async (req, res) => {
  const { rows: peopleCount } = await pool.query('SELECT COUNT(*)::int as count FROM people');
  const { rows: famCount } = await pool.query('SELECT COUNT(*)::int as count FROM families');
  const { rows: payTotal } = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
  const { rows: expTotal } = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
  const balance = payTotal[0].total - expTotal[0].total;
  const { rows: recentPayments } = await pool.query(`
    SELECT pa.*, pe.name as person_name
    FROM payments pa
    JOIN people pe ON pa.person_id = pe.id
    ORDER BY pa.created_at DESC LIMIT 5
  `);
  const { rows: activeRounds } = await pool.query(`
    SELECT pr.*, COUNT(pa.id)::int as paid_count, COALESCE(SUM(pa.amount), 0) as total_paid
    FROM payment_rounds pr
    LEFT JOIN payments pa ON pa.round_id = pr.id
    GROUP BY pr.id
    HAVING COUNT(pa.id) < (SELECT COUNT(*)::int FROM people)
    ORDER BY pr.date DESC
  `);
  const { rows: familyStats } = await pool.query(`
    SELECT f.id, f.name, f.color,
      COUNT(DISTINCT p.id)::int as member_count,
      COUNT(DISTINCT pa.id)::int as paid_count,
      COALESCE(SUM(pa.amount), 0) as total_paid
    FROM families f
    LEFT JOIN people p ON p.family_id = f.id
    LEFT JOIN payments pa ON pa.person_id = p.id
    GROUP BY f.id
    ORDER BY f.name
  `);

  res.json({
    totalPeople: peopleCount[0].count,
    totalFamilies: famCount[0].count,
    totalPayments: payTotal[0].total,
    totalExpenses: expTotal[0].total,
    balance,
    recentPayments,
    activeRounds,
    familyStats,
  });
});

// ─── HISTORY ───
app.get('/api/history', async (req, res) => {
  const { family, month, type } = req.query;
  const params = [];
  const conditions = [];

  if (family && family !== 'todas') {
    params.push(family);
    conditions.push(`pe.family_id = $${params.length}`);
  }
  if (month) {
    params.push(month + '-01');
    conditions.push(`p.date >= $${params.length} AND p.date < ($${params.length}::date + interval '1 month')`);
  }
  if (type && type === 'pago') {
    // only payments - already filtering by UNION below
  }
  if (type && type === 'gasto') {
    // only expenses
  }

  const wherePay = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const whereExp = month && (type === 'todos' || !type || type === 'gasto')
    ? `WHERE e.date >= '${month}-01' AND e.date < ('${month}-01'::date + interval '1 month')`
    : '';

  let unionQuery;
  if (type === 'gasto') {
    unionQuery = `SELECT e.id, e.amount, e.date, e.description, e.created_at,
      NULL::text as person_name, NULL::int as family_id, NULL::text as family_name, NULL::text as family_color,
      'gasto' as tipo, e.category as round_concept
      FROM expenses e ${whereExp} ORDER BY date DESC, created_at DESC`;
  } else if (type === 'pago') {
    unionQuery = `SELECT p.id, p.amount, p.date, p.description, p.created_at,
      pe.name as person_name, pe.family_id, f.name as family_name, f.color as family_color,
      'pago' as tipo, pr.concept as round_concept
      FROM payments p JOIN people pe ON p.person_id = pe.id
      LEFT JOIN families f ON pe.family_id = f.id
      LEFT JOIN payment_rounds pr ON p.round_id = pr.id
      ${wherePay} ORDER BY date DESC, created_at DESC`;
  } else {
    unionQuery = `SELECT * FROM (
      SELECT p.id, p.amount, p.date, p.description, p.created_at,
        pe.name as person_name, pe.family_id, f.name as family_name, f.color as family_color,
        'pago' as tipo, pr.concept as round_concept
      FROM payments p JOIN people pe ON p.person_id = pe.id
      LEFT JOIN families f ON pe.family_id = f.id
      LEFT JOIN payment_rounds pr ON p.round_id = pr.id
      ${wherePay}
      UNION ALL
      SELECT e.id, e.amount, e.date, e.description, e.created_at,
        NULL::text as person_name, NULL::int as family_id, NULL::text as family_name, NULL::text as family_color,
        'gasto' as tipo, e.category as round_concept
      FROM expenses e ${whereExp}
    ) sub ORDER BY date DESC, created_at DESC`;
  }

  const { rows: all } = await pool.query(unionQuery, params);

  const totalIngresos = all.filter(t => t.tipo === 'pago').reduce((s, p) => s + p.amount, 0);
  const totalGastos = all.filter(t => t.tipo === 'gasto').reduce((s, e) => s + e.amount, 0);

  res.json({ transactions: all, totalIngresos, totalGastos, balance: totalIngresos - totalGastos });
});

// ─── BUDGET ───
app.get('/api/budget', async (req, res) => {
  const { rows: categories } = await pool.query(`
    SELECT bc.*,
      COALESCE(SUM(pca.amount), 0) as collected,
      (SELECT COUNT(*)::int FROM people) as people_count
    FROM budget_categories bc
    LEFT JOIN person_category_alloc pca ON pca.category_id = bc.id
    GROUP BY bc.id
    ORDER BY bc.name
  `);
  const { rows: people } = await pool.query(`
    SELECT p.id, p.name, f.name as family_name, f.color as family_color,
      COALESCE((SELECT SUM(amount) FROM payments WHERE person_id = p.id), 0) as total_paid
    FROM people p
    LEFT JOIN families f ON p.family_id = f.id
    ORDER BY f.name, p.name
  `);
  const totalGoal = categories.reduce((s, c) => s + c.goal, 0);
  const totalCollected = categories.reduce((s, c) => s + c.collected, 0);
  res.json({ categories, people, totalGoal, totalCollected });
});

app.post('/api/budget/categories', requireAdmin, async (req, res) => {
  const { name, goal } = req.body;
  const { rows } = await pool.query('INSERT INTO budget_categories (name, goal) VALUES ($1, $2) RETURNING id', [name, goal || 0]);
  res.json({ id: rows[0].id, name, goal });
});

app.put('/api/budget/categories/:id', requireAdmin, async (req, res) => {
  const { name, goal } = req.body;
  await pool.query('UPDATE budget_categories SET name = $1, goal = $2 WHERE id = $3', [name, goal || 0, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/budget/categories/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM person_category_alloc WHERE category_id = $1', [req.params.id]);
  await pool.query('DELETE FROM budget_categories WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

app.put('/api/budget/alloc/:personId/:categoryId', requireAdmin, async (req, res) => {
  const { amount } = req.body;
  await pool.query(`
    INSERT INTO person_category_alloc (person_id, category_id, amount, is_manual)
    VALUES ($1, $2, $3, 1)
    ON CONFLICT (person_id, category_id) DO UPDATE SET amount = $3, is_manual = 1
  `, [req.params.personId, req.params.categoryId, amount]);
  res.json({ success: true });
});

app.delete('/api/budget/alloc/:personId/:categoryId', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM person_category_alloc WHERE person_id = $1 AND category_id = $2',
    [req.params.personId, req.params.categoryId]);
  res.json({ success: true });
});

app.post('/api/abono', requireAdmin, async (req, res) => {
  const { person_id, amount, date, description } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO payments (person_id, amount, date, description) VALUES ($1, $2, $3, $4) RETURNING id',
    [person_id, amount, date || new Date().toISOString().split('T')[0], description || 'Abono general']
  );
  res.json({ id: rows[0].id, ...req.body });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
