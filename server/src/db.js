const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/viaje',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const schema = `
  CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    head_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    family_id INTEGER,
    phone TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    date TEXT NOT NULL,
    description TEXT DEFAULT '',
    round_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    date TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    paid_by INTEGER REFERENCES people(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS payment_rounds (
    id SERIAL PRIMARY KEY,
    concept TEXT NOT NULL,
    amount_per_person DOUBLE PRECISION NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS budget_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    goal DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS person_category_alloc (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    is_manual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS trip_info (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_people_family ON people(family_id);
  CREATE INDEX IF NOT EXISTS idx_payments_person ON payments(person_id);
  CREATE INDEX IF NOT EXISTS idx_payments_round ON payments(round_id);
  CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_pcat_alloc ON person_category_alloc(person_id, category_id);

  -- Add foreign keys after all tables exist (avoid circular dependency)
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_families_head') THEN
      ALTER TABLE families ADD CONSTRAINT fk_families_head FOREIGN KEY (head_id) REFERENCES people(id) ON DELETE SET NULL;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_people_family') THEN
      ALTER TABLE people ADD CONSTRAINT fk_people_family FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_person') THEN
      ALTER TABLE payments ADD CONSTRAINT fk_payments_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_payments_round') THEN
      ALTER TABLE payments ADD CONSTRAINT fk_payments_round FOREIGN KEY (round_id) REFERENCES payment_rounds(id) ON DELETE SET NULL;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_expenses_paid_by') THEN
      ALTER TABLE expenses ADD CONSTRAINT fk_expenses_paid_by FOREIGN KEY (paid_by) REFERENCES people(id) ON DELETE SET NULL;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_pcat_alloc_person') THEN
      ALTER TABLE person_category_alloc ADD CONSTRAINT fk_pcat_alloc_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_pcat_alloc_category') THEN
      ALTER TABLE person_category_alloc ADD CONSTRAINT fk_pcat_alloc_category FOREIGN KEY (category_id) REFERENCES budget_categories(id) ON DELETE CASCADE;
    END IF;
  END $$;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    // Seed defaults if empty
    const exists = await client.query("SELECT COUNT(*) as c FROM settings");
    if (parseInt(exists.rows[0].c) === 0) {
      const seed = [
        ['admin_password', 'admin123'],
        ['trip_name', 'Viaje a Coveñas 2027'],
        ['trip_origin', 'El Copey, Cesar'],
        ['trip_destination', 'Coveñas, Sucre'],
        ['trip_date_start', '2027-01-02'],
        ['trip_date_end', '2027-01-07'],
        ['trip_description', 'Viaje familiar de El Copey a Coveñas - Enero 2027'],
      ];
      for (const [key, value] of seed) {
        await client.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
      }
    }
    console.log('Base de datos migrada correctamente');
  } finally {
    client.release();
  }
}

// Run migration on import
if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else {
  migrate().catch(e => console.error('Error en migración:', e));
}

module.exports = pool;
