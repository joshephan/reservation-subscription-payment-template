import { admin } from 'src/schema/admin';

export type CreateAdminDto = Partial<typeof admin.$inferInsert> & {
  name: string;
  email: string;
  password: string;
};
