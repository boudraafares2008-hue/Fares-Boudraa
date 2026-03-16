import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('jewelry.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    images TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (id, name, price, category, images, description) VALUES (?, ?, ?, ?, ?, ?)');
  const initialProducts = [
    ['1', 'Anillo Solitario Diamante', 1250, 'diamantes', JSON.stringify(['/FOTOS/alianza_zafiros.png']), 'Elegante anillo de oro blanco con un diamante central de 0.5 quilates.'],
    ['2', 'Reloj Cronógrafo Luxury', 3400, 'relojes', JSON.stringify(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800']), 'Maquinaria suiza de alta precisión con acabados en acero inoxidable.'],
    ['3', 'Collar de Oro 18k', 890, 'oro', JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800']), 'Cadena de eslabones finos en oro amarillo de 18 quilates.'],
    ['4', 'Pendientes Brillantes', 1560, 'diamantes', JSON.stringify(['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800']), 'Par de pendientes con diamantes talla brillante engastados en garras.'],
    ['5', 'Reloj Clásico Piel', 1200, 'relojes', JSON.stringify(['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800']), 'Reloj de vestir con correa de piel genuina y esfera minimalista.'],
    ['6', 'Pulsera Rígida Oro', 2100, 'oro', JSON.stringify(['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800']), 'Brazalete rígido con cierre de seguridad en oro rosa.']
  ];
  initialProducts.forEach(p => insert.run(...p));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
  app.use('/FOTOS', express.static(path.join(__dirname, 'FOTOS')));

  // API Routes
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { id, name, price, category, images, description } = req.body;
    db.prepare('INSERT INTO products (id, name, price, category, images, description) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, price, category, images, description);
    res.status(201).json({ success: true });
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, price, category, images, description } = req.body;
    db.prepare('UPDATE products SET name = ?, price = ?, category = ?, images = ?, description = ? WHERE id = ?').run(name, price, category, images, description, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/messages', (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json(messages);
  });

  app.post('/api/messages', (req, res) => {
    const { id, name, phone, type, message } = req.body;
    db.prepare('INSERT INTO messages (id, name, phone, type, message) VALUES (?, ?, ?, ?, ?)').run(id, name, phone, type, message);
    res.status(201).json({ success: true });
  });

  app.put('/api/messages/:id', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
