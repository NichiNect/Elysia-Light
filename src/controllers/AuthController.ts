import fs from 'fs';
import { ControllerContext } from "elysia"
import bcrypt from 'bcrypt';
import User from "@/models/User"
import { Auth } from '@/utils/auth.utils';
import { db } from "@/utils/db.utils";
import UserMailToken from "@/mails/UserMailToken.mail";
import path from 'path';

export class AuthController {
    // =============================================>
    // ## Login with email & password
    // =============================================>
    static async login(c: ControllerContext) {
        await c.validation({
            email     :  "required",
            password  :  "required",
        })

        const { email, password } = c.body as Record<string, any>

        const result = await User.query().where("email", email).whereNotNull("email_verification_at").first();

        if (!result) return c.responseErrorValidation({email: ["E-mail not found!"]})

        const user = result.toJSON()

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) return c.responseErrorValidation({password: ["Wrong password!"]})
        
        const { token } = await Auth.createAccessToken(user.id)

        c.responseSuccess({ user, token }, "Success")
    }


    // =============================================>
    // ## Register new account.
    // =============================================>
    static async register(c: ControllerContext) {
        await c.validation({
            name      :  "required",
            email     :  "required",
            password  :  "required",
        })

        const trx = await db.beginTransaction()

        const { email, password } = c.body as Record<string, any>

        const checkRegisteredUser = await User.query().where("email", email).whereNotNull("email_verification_at").first()

        if (checkRegisteredUser) c.responseErrorValidation({email: ["Email is registered!"]})

        await User.query().where("email", email).whereNull("email_verification_at").delete();
        
        const model = new User().dumpField(c.body as Record<string, any>)

        model.fill({
            "password": await bcrypt.hash(password, 10)
        })

        try {
            await model.save({ trx })            
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }

        const user = model.toJSON()

        const { token } = await Auth.createAccessToken(user.id)

        const { token: mailToken } = await Auth.createUserMailToken(user.id)
        
        await UserMailToken(user, mailToken)

        await trx.commit()

        c.responseSuccess({ user, token }, "Success")
    }


    // =============================================>
    // ## Verify user mail token.
    // =============================================>
    static async verify(c: ControllerContext) {
        await c.validation({
            token      :  "required",
        })

        const { token } = c.body as Record<string, any>

        if (!c.user) {
            throw c.status(401, {
                message: "Unauthorized!"
            })
        }

        const verify = await Auth.verifyUserMailToken(c?.user?.id, token);
        if(!verify)  {
            c.responseErrorValidation({token: ["Invalid Token!"]})
        }

        await User.query().where("id", c?.user?.id).update({ email_verification_at: new Date() }) 

        c.responseSuccess({ user: c.user }, "Success")
    }


    // =============================================>
    // ## Get logged account
    // =============================================>
    static async me(c: ControllerContext) {
        c.responseSuccess(c.user, "Success")
    }

    // =============================================>
    // ## Edit logged account
    // =============================================>
    static async update(c: ControllerContext) {
        const model = await User.query().apply(User.findOrNotFound(c.user.id))

        await c.validation({
            name   :  "required",
            email  :  "required",
        })

        const trx = await db.beginTransaction()

        const body = c.body as Record<string, any>;

        model.dumpField(body)

        if (body.image && body.image instanceof File) {
            const imageSource = await c.uploadFile(body.image, 'users');

            model.fill({image: imageSource});
        }
        
        try {
            await model.save({ trx })
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }
        
        await trx.commit()
        c.responseSaved(model.toJSON())
    }
}