# Backlog
- define IEventRepository
- define IOrderRepository
- define IUserRepository
- define ILogger
- define IClock
- define IIdempotencyStore

- implement ILogger using Pino
- implement IClock using Date
- implement IIdempotencyStore using Promise atomic lock
- create use-case implementations (builders)

- define endpoints schema
- map domain to http error

# Doing
- get db up and running
   - setup drizzle + neon (no self-deployed infra for first iter) 
- add healthcheck endpoint

# Done
- model general response format for success and error
- model use-cases types
- establish project directory structure
- model domain