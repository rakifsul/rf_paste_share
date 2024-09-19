# rf_paste_share - Node.js Paste Sharing App

[README dengan Bahasa Indonesia Klik di Sini](https://github.com/rakifsul/rf_paste_share/blob/main/README_id.md)

## What is This Software?

rf_paste_share is a Node.js paste sharing web app.

## How It Works

This application works like a typical CRUD, but there are some additional features such as auto delete.

## How to Try This Code

### How to Try server-mongoose

To try the server-mongoose code, navigate to the server-mongoose folder via the command line.

Next, create a .env file inside the folder.

Then, configure the database settings and other configurations in the .env file based on .env-example.

The server-mongoose code requires MongoDB, so make sure you have installed it and created the database as per the previous configuration.

Next, run:

```
npm install
```

Then, run:

```
npm run dev
```

Finally, open your browser to the address listed in the BASE_URL in the .env file.

### How to Try server-knex

To try the server-knex code, create a .env file inside the folder.

Then, fill in the .env file based on .env-example. Here you can change the port, environment, and database details.

The server-knex code requires MySQL, so make sure you have installed it and created the database according to the configuration.

Now, make sure you are inside the server-knex folder.

Next, run:

```
npm install
```

Then, run:

```
npm run db:refresh
```

Then, run:

```
npm run dev
```

Finally, open your browser to the address listed in the BASE_URL in the .env file.

Default admin login:

```
username: admin@example.com
password: admin
```

## Freelance Worker Link

- https://projects.co.id/public/browse_users/view/99bc11/rakifsul