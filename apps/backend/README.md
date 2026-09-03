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
