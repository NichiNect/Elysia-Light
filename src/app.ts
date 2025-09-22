import { Elysia } from 'elysia'
import { routes } from './routes'
import { db } from "./utils/db.utils"
import { Controller } from './utils/controller.utils'


export const app  =  new Elysia()
    .use(Controller)
    .use(routes)
    

db.schema
console.log(`💡 Database connected!`)

app.listen(4000)
console.log(`🚀 Server is running at http://localhost:4000!`)