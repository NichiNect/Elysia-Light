import { Elysia } from 'elysia'
import { api } from '@/utils/route.utils'
import { AuthMiddleware } from '@/utils/middleware.utils'

import { BaseController } from '@/controllers/BaseController'
import { AuthController } from '@/controllers/AuthController'
import { UserController } from '@/controllers/UserController'

export const routes = (app: Elysia) => app.group('/api', (route) => {
    route.get('/', BaseController.index)
    
    route.post('/login', AuthController.login)
    route.post('/register', AuthController.register)
    
    route.use(AuthMiddleware)
    
    route.post('/verify', AuthController.verify)
    route.get('/me', AuthController.me)
    route.post('/me/update', AuthController.update)

    api(route, "/users", UserController);

    return route;
})