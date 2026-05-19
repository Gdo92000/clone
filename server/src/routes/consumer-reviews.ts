import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { reviews, users } from '../db/schema';

const route = new Hono();

route.get('/', async (c) => {
  const restaurantId = c.req.query('restaurant_id');
  const query = db.select({
    id: reviews.id,
    user_id: reviews.user_id,
    restaurant_id: reviews.restaurant_id,
    order_id: reviews.order_id,
    rating: reviews.rating,
    comment: reviews.comment,
    created_at: reviews.created_at,
    author_name: users.name,
  }).from(reviews).leftJoin(users, eq(reviews.user_id, users.id));

  if (restaurantId) {
    query.where(eq(reviews.restaurant_id, restaurantId));
  }

  const result = await query;
  return c.json(result);
});

route.get('/restaurant/:id', zValidator('param', z.object({ id: z.string().min(1).max(64) })), async (c) => {
  const { id } = c.req.valid('param');
  const result = await db.select({
    id: reviews.id,
    user_id: reviews.user_id,
    restaurant_id: reviews.restaurant_id,
    order_id: reviews.order_id,
    rating: reviews.rating,
    comment: reviews.comment,
    created_at: reviews.created_at,
    author_name: users.name,
  }).from(reviews).leftJoin(users, eq(reviews.user_id, users.id)).where(eq(reviews.restaurant_id, id));
  return c.json(result);
});

export default route;
