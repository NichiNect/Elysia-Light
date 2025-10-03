import { Elysia } from 'elysia'
import { CorsMiddleware } from '@/utils/middleware.utils'
import { Controller } from '@/utils/controller.utils'
import { db } from "@/utils/db.utils"
import { redis } from "@/utils/cache.utils"
import { routes } from '@/routes'


export const app  =  new Elysia()
    .use(CorsMiddleware)
    .use(Controller)
    .use(routes)
    

db.schema
console.log(`💡 Database connected!`)

redis.on("connect", () => {
    console.log("💡 Redis connecting...")
})

redis.on("error", (err) => {
    console.error("❌ Redis error:", err)
})

app.listen(4000)
console.log(`🚀 Server is running at http://localhost:4000!`)