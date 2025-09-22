import User from '../models/User'
import type { ControllerContext } from "elysia"
import { db } from '../utils/db.utils'

export class UserController {
    // ========================================>
    // ## Display a listing of the resource.
    // ========================================>
    static async index(c: ControllerContext) {
        const users = await User.query()
            .apply(User.search(c.getQuery.search, ['name']))
            .apply(User.filter(JSON.parse(c.getQuery.filter)))
            .apply(User.selectableColumns())
            .orderBy(c.getQuery.sortBy, c.getQuery.sortDirection)
            .paginate(1,c.getQuery.paginate)
        
        c.responseData(users.items().toJSON(), users.total())
    }


    // =============================================>
    // ## Store a newly created resource.
    // =============================================>
    static async store(c: ControllerContext) {
        c.validation({
            name   :  "required",
            email  :  "required",
        })

        const trx = await db.beginTransaction()
        
        const model = new User().dumpField(c.body as Record<string, any>)

        try {
            await model.save({ trx })            
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }

        await trx.commit()
        c.responseSaved(model.toJSON())
    }


    // ============================================>
    // ## Update the specified resource.
    // ============================================>
    static async update(c: ControllerContext) {
        const model = await User.query().apply(User.findOrNotFound(c.params.id))

        c.validation({
            name   :  "required",
            email  :  "required",
        })
        
        const trx = await db.beginTransaction()
        
        model.dumpField(c.body as Record<string, any>)

        try {
            await model.save({ trx })
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }
        
        await trx.commit()
        c.responseSaved(model.toJSON())
    }


    // ===============================================>
    // ## Remove the specified resource.
    // ===============================================>
    static async destroy(c: ControllerContext) {
        const model = await User.query().apply(User.findOrNotFound(c.params.id))
        
        try {
            await model.delete()
        } catch (err) {
            c.responseError(err as Error, "Delete User")
        }

        c.responseSuccess(model.toJSON())
    }
}