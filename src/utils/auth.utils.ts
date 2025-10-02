import crypto from 'crypto'
import User from '@/models/User'
import { db } from './db.utils'
import { Context } from 'elysia'

// =====================================>
// ## Auth: Personal Access Token
// =====================================>
const TOKEN_PLAIN_LENGTH = 20

export const Auth = {
  async createPersonalToken(userId: number) {
    const plain = crypto.randomBytes(TOKEN_PLAIN_LENGTH).toString('hex')
    const hash = crypto.createHash('sha256').update(plain).digest('hex')
  
    await db.table('personal_access_tokens').insert({
      user_id     : userId,
      token       : hash,
      created_at  : new Date(),
    })
    
    const record = await db.table('personal_access_tokens').orderBy('id', 'desc').first()
  
    return {
      token    : `${record.id}|${plain}`,
      tokenId  : record.id
    }
  },
  
  async revokePersonalToken(id: number) {
    return db.table('personal_access_tokens').where("id", id).delete()
  },
  
  async verifyPersonalToken(token: string) {
    let idPart: string | null = null
    let plain = token
  
    if (token.includes('|')) {
      const [id, tokenPart] = token.split('|', 2)
      idPart = id
      plain = tokenPart
    }
  
    const hash = crypto.createHash('sha256').update(plain).digest('hex')
    let tokenRecord = null
  
    if (idPart) {
      tokenRecord = await db.table('personal_access_tokens').where("id", idPart).where("token", hash).first()
    } else {
      tokenRecord = await db.table('personal_access_tokens').where("token", hash).first()
    }
  
    if (!tokenRecord) return null
  
    await db.table('personal_access_tokens').where("id", tokenRecord.id).update({ last_used_at: new Date() })
  
    const user = await User.query().find(tokenRecord.user_id)
    return { user, token: tokenRecord }
  },
  
  // =====================================>
  // ## Auth: Json Web Token
  // =====================================>
  //.....................................//
}