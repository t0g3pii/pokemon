import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'pokemon_go_research',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const SECRET_KEY = 'your_secret_key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    const token = jwt.sign({ id: result.insertId, email }, SECRET_KEY);
    res.status(201).json({ id: result.insertId, email, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, SECRET_KEY);
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get field researches for user
app.get('/api/field-researches', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT fr.id, fr.title, fr.current_stage, fr.total_stages,
             m.id AS mission_id, m.description AS mission_description, m.completed,
             r.id AS reward_id, r.description AS reward_description, r.obtained
      FROM field_researches fr
      LEFT JOIN missions m ON fr.id = m.field_research_id
      LEFT JOIN rewards r ON fr.id = r.field_research_id
      WHERE fr.user_id = ?
    `, [req.user.id]);

    const fieldResearches = rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          title: row.title,
          currentStage: row.current_stage,
          totalStages: row.total_stages,
          missions: [],
          rewards: []
        };
      }
      if (row.mission_id) {
        acc[row.id].missions.push({
          id: row.mission_id,
          description: row.mission_description,
          completed: row.completed
        });
      }
      if (row.reward_id) {
        acc[row.id].rewards.push({
          id: row.reward_id,
          description: row.reward_description,
          obtained: row.obtained
        });
      }
      return acc;
    }, {});

    res.json(Object.values(fieldResearches));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field researches' });
  }
});

// Toggle mission completion
app.post('/api/field-researches/:researchId/missions/:missionId/toggle', authenticateToken, async (req, res) => {
  try {
    const { researchId, missionId } = req.params;
    await pool.query('UPDATE missions SET completed = NOT completed WHERE id = ? AND field_research_id = ?', [missionId, researchId]);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle mission' });
  }
});

// Toggle reward obtained status
app.post('/api/field-researches/:researchId/rewards/:rewardId/toggle', authenticateToken, async (req, res) => {
  try {
    const { researchId, rewardId } = req.params;
    await pool.query('UPDATE rewards SET obtained = NOT obtained WHERE id = ? AND field_research_id = ?', [rewardId, researchId]);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle reward' });
  }
});

// Admin routes
const authenticateAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  next();
};

// Get all field researches (admin)
app.get('/api/admin/field-researches', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, total_stages FROM field_researches');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field researches' });
  }
});

// Create new field research (admin)
app.post('/api/admin/field-researches', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { title, totalStages } = req.body;
    const [result] = await pool.query('INSERT INTO field_researches (title, total_stages) VALUES (?, ?)', [title, totalStages]);
    res.status(201).json({ id: result.insertId, title, totalStages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create field research' });
  }
});

// Delete field research (admin)
app.delete('/api/admin/field-researches/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM field_researches WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete field research' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});