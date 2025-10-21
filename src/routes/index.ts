import { Elysia } from 'elysia'
import { api } from '@/utils/route.utils'
import { AuthMiddleware } from '@/utils/middleware.utils'

import { BaseController } from '@/controllers/BaseController'
import { AuthController } from '@/controllers/AuthController'
import { UserController } from '@/controllers/UserController'

export const routes = (app: Elysia) => app.group('/api', (route) => {
    route.get('/', BaseController.index)
    
    route.post('/login', AuthController.login)
    
    // route.use(AuthMiddleware)
    
    route.get('/me', AuthController.me)

    api(route, "/users", UserController);

    return route;
})