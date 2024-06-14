import { Hono } from 'hono'

const app = new Hono()


app.get('/', (c) => c.text('Hello Bun!'))

const port = process.env.PORT

Bun.serve( { 
    port: 3000, 
    development: true,
    fetch: app.fetch, 
  } )
  
console.log(`runnin da server on ${port}`)  