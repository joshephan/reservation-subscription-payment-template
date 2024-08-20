import { admin } from 'src/schema/admin';

export type CreateAdminDto = Partial<typeof admin.$inferInsert> & {
  password: string;
};
