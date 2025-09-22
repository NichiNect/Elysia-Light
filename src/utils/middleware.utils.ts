import { Elysia } from 'elysia'


// =============================>
// ## Sample auth middleware
// =============================>
export const authMiddleware = (app: Elysia) => app.derive(({ request }) => {
    const token  =  request.headers.get('authorization')
    
    if (!token || token !== 'Bearer secret') { throw new Error('Unauthorized') }
    
    return { user: { id: 1, name: 'Admin' } }
})