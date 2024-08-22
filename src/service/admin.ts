import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { admin } from '../schema/admin';
import bcrypt from 'bcrypt';
import { CreateAdminDto } from 'src/dto/admin';
import { SupabaseS3Service } from './s3';

@Injectable()
export class AdminService {
  constructor(private db: PostgresJsDatabase) {}

  async login(email: string, password: string) {
    const [admin] = await this.getAdminByEmail(email);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    return admin;
  }

  async createAdmin(adminData: CreateAdminDto) {
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

  async updateAdmin(
    id: number,
    adminData: Partial<typeof admin.$inferInsert> & {
      profilePicture?: string;
    },
    profileImage?: File,
  ) {
    if (profileImage) {
      const s3Service = new SupabaseS3Service('profile-images');
      const uploadedUrl = await s3Service.uploadFile(
        profileImage,
        `admin_${id}/profile.${profileImage.type.split('/')[1]}`,
      );
      adminData.profilePicture = uploadedUrl;
    }

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

    // 프로필 이미지 삭제
    const s3Service = new SupabaseS3Service('profile-images');
    await s3Service.deleteFile(`admin_${id}/profile`);

    return result[0];
  }

  async getAllAdmins() {
    return await this.db.select().from(admin);
  }
}
