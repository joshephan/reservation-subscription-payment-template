import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { admin } from '../schema/admin';
import bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private db: PostgresJsDatabase) {}

  async createAdmin(
    adminData: Partial<typeof admin.$inferInsert> & { password: string },
  ) {
    const saltRounds = 10;
    const salt = process.env.ENCRYPT_ADMIN_SALT_STRING;

    const hashedPassword = await bcrypt.hash(
      adminData.password + salt,
      saltRounds,
    );
    adminData.password = hashedPassword;

    const result = await this.db.insert(admin).values(adminData).returning();

    if (!result || result.length === 0) {
      throw new Error('Admin creation failed');
    }

    return result[0];
  }

  async getAdminById(id: number) {
    return await this.db.select().from(admin).where(eq(admin.id, id)).limit(1);
  }

  async getAdminByEmail(email: string) {
    return await this.db
      .select()
      .from(admin)
      .where(eq(admin.email, email))
      .limit(1);
  }

  async updateAdmin(id: number, adminData: Partial<typeof admin.$inferInsert>) {
    const result = await this.db
      .update(admin)
      .set(adminData)
      .where(eq(admin.id, id))
      .returning();
    return result[0];
  }

  async deleteAdmin(id: number) {
    const result = await this.db
      .delete(admin)
      .where(eq(admin.id, id))
      .returning();
    return result[0];
  }

  async getAllAdmins() {
    return await this.db.select().from(admin);
  }
}
