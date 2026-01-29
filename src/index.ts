import { serve } from "@hono/node-server";
import app from "./http/app.js";
import "./handler/index.js";

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Internal Server Error', 500)
}) 

serve({
  fetch: app.fetch,
  port: 8000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
