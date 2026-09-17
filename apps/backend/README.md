# POS Backend (@pos/backend)

Backend for the pos software.

## Run Locally

First clone the whole workspace repo, cause each part may depend on other part in the workspace.

```bash
  git clone http://github.com/s5sajid/pos
```

Go to the project directory

```bash
  cd pos
```

Install dependencies (Use bun cause we prefer it, and also work with it's workspace feature.)

```bash
# Then install all the packages at root level.
bun install

# for a specific pacakage only run
bun filter=@pos/<name> install
```

Start the server

```bash
  bun dev
```

## MCP Readonly user:

To allow readonly access for the mcp, you need to create a new user with only read permission.

```sql
-- Create the account
CREATE USER mcp_readonly WITH PASSWORD 'PASSWORD';

GRANT CONNECT ON DATABASE neondb TO mcp_readonly;


-- Prevent them from ever doing a write operation
ALTER USER mcp_readonly SET default_transaction_read_only = on;

-- Kill any query they run that takes longer than 15 seconds (15000 milliseconds)
ALTER USER mcp_readonly SET statement_timeout = 10000;

-- Kill any transaction that sits idle inside a lock for too long
ALTER USER mcp_readonly SET idle_in_transaction_session_timeout = 15000;

-- Limit the memory they can use for sorting/hashes so they don't eat up server RAM
ALTER USER mcp_readonly SET work_mem = '150MB';

-- Grant read-only access to all current and future data
GRANT pg_read_all_data TO mcp_readonly;

```

Confirm created by running

```sql
SELECT usename AS username, usesuper AS is_superuser, usecreatedb AS can_create_db
FROM pg_catalog.pg_user;
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
DATABASE_URL="" # Database URL for the pooled connection
DATABASE_URL_UNPOOLED="" # Database URL for the unpooled connection

BETTER_AUTH_SECRET="" # Secret used for encryption etc
BETTER_AUTH_URL= # URL for the BetterAuth server
FRONTEND_URL= # URL for the frontend application
```

## Roadmap

- Nice to have:
  - Discount
  - Taxes
- Supplier support
- Multiple stores support

## Authors

- [@s5sajid](https://www.github.com/s5sajid)

## Feedback

If you have any feedback, please reach out to us at s5sajidyt@gmail.com
