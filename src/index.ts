import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createFactory } from 'hono/factory'
import type { HonoOptions } from 'hono/hono-base'

type Env = {
   Variables: {
      MY_VARIABLE: string
   }
} 

const factory = createFactory<Env>()
const app = factory.createApp()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Internal Server Error', 500)
}) 

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
