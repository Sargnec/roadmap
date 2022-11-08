import redis, { databaseName } from 'lib/redis'
import { unstable_getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export default async (req, res) => {
  const session = (await unstable_getServerSession(
    req,
    res,
    authOptions as NextAuthOptions
  )) as any

  try {
    if (session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID) {
      throw new Error('Unauthorized')
    }

    const { title, createdAt, user, status } = req.body
    const FEATURE = JSON.stringify({ title, createdAt, user, status })

    const isRemove = await redis.zrem(databaseName, FEATURE)

    if (!isRemove) {
      throw new Error('Feature not found')
    }

    res.json({ body: 'success' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
