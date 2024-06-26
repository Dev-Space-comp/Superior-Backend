import { Hono } from 'hono'
import { Database } from "bun:sqlite";
import { logger } from 'hono/logger'


const db = new Database("./db/mydb.sqlite", { create: true });
db.exec("PRAGMA journal_mode = WAL;");
const app = new Hono()
app.use(logger())


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

app.get('/', (c) => c.text('Hello Bun!'))

app.post('/', async (c) => {
  const body = await c.req.json();
  const { firstName ,lastName, email, pass } = body;
  const user = db.query(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `);
  user.run(firstName + lastName, email, Bun.password.hashSync(pass))
  return c.json({ firstName, lastName, email, pass });
})

app.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, pass } = body;
  const user = db.query(`
    SELECT * FROM users WHERE email = ? AND password = ?
  `);
  
  if(user.get(email, Bun.password.hashSync(pass)) == null) {
    return c.json({"userexists":false})
  }else { 
    return c.json({"userexists":true})
  }
})

const port = process.env.PORT || 3000;

Bun.serve({
  port: port,
  development: true,
  fetch: app.fetch,
})

console.log(`Running the server on port ${port}`);
