/*
Responsibility:
- initialize hono app, middleware, infra-wiring 
*/

import { createFactory } from "hono/factory";

// TODO: move to a separate types file
type Env = {
   Variables: {
      MY_VARIABLE: string
   }
} 

export const factory = createFactory<Env>()
const app = factory.createApp()

export default app;