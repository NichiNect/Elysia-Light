import { Elysia } from 'elysia'
import { api } from '@/utils/route.utils'
// import { authMiddleware } from '@/utils/middleware.utils'

import { BaseController } from '@/controllers/BaseController'
import { UserController } from '@/controllers/UserController'

export const routes = (app: Elysia) => app.group('/api', (route) => {
    route.get('/', BaseController.index)
    // route.use(authMiddleware)

    api(route, "/users", UserController);

    return route;
})