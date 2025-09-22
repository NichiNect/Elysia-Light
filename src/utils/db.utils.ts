import { sutando, Model } from 'sutando'

// ==============================>
// ## Database connection
// ==============================>
sutando.addConnection({
  client      :  process.env.DB_CONNECTION    || 'pg',
  connection  :  {
    host      :  process.env.DB_HOST          ||  '127.0.0.1',
    port      :  Number(process.env.DB_PORT)  ||  5432,
    user      :  process.env.DB_USERNAME      ||  'postgres',
    password  :  process.env.DB_PASSWORD      ||  'password',
    database  :  process.env.DB_DATABASE      ||  'db_light',
  },
  migrations: {
    directory: "./database/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./database/seeders",
    extension: "ts",
  },
})

export const db  =  sutando.connection()



// =================================>
// ## add apply function to model
// =================================>
const origQuery  =  Model.query

Model.query = function (...args: any) {
  const query = origQuery.apply(this, args)
  if (!(query as any).apply) {
    ;(query as any).apply = function (fn: (q: any) => any) {
      return fn(this)
    }
  }
  return query
}

