import { users } from '../db/schema/user';
import { Request } from 'express';

type UserT = typeof users.$inferSelect;

export interface ContextT {
  user: UserT;
  req: Request;
}
