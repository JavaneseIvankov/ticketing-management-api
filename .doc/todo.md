# Backlog
- implement repos
   - create required query and mutation logic
   - implement db error handler logic
   - ensure critical sections are wrapped in tx
- add deps-wiring and use-case initialization

# Doing
- create use-case implementations (builders)

# Done
- declare confirm logic in IOrderRepo
- test health-check
- finalize wether we need to model System errors
   - if yes: model it then use it in infra & repo
- define endpoints schema
- map domain to http error
- model general response format for success and error
- model use-cases types
- establish project directory structure
- model domain
- define IEventRepository
- define IOrderRepository
- define IUserRepository
- define ILogger
- define IClock
- define IKeyValueStore
- implement ILogger using Pino
- implement IClock using Date
- implement IKeyValueStore using Promise atomic lock
- get db up and running
   - setup drizzle + neon (no self-deployed infra for first iter) 
- add healthcheck endpoint