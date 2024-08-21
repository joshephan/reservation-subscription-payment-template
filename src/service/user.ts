import { Injectable } from '@nestjs/common';
import { asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { user } from '../schema/user';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private db: PostgresJsDatabase) {}

  async createUser(
    userData: Partial<typeof user.$inferInsert> & { password: string },
  ) {
    const saltRounds = 10;
    const salt = process.env.ENCRYPT_SALT_STRING;

    const hashedPassword = await bcrypt.hash(
      userData.password + salt,
      saltRounds,
    );
    userData.password = hashedPassword;

    const result = await this.db.insert(user).values(userData).returning();

    // 생성이 안되는 경우에 대해서 에러 캐칭은 필요하다.
    if (!result || result.length === 0) {
      throw new Error('유저 생성 실패요 ㅋㅋ');
    }

    return result[0];
  }

  /**
   * 아이디를 통해 유저 정보를 획득
   * @author 상훈
   * @param id 유저 아이디
   * @returns 유저 정보
   */
  async getUserById(id: number) {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return result;
  }

  async getUserByEmail(email: string) {
    return await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
  }

  /**
   * 업데이트는 유저 본인이 하거나 또는 관리자만 할 수 있어야 한다
   * @param id
   * @param userData
   * @returns
   */
  async updateUser(
    id: number,
    userData: Partial<typeof user.$inferInsert> & {
      password?: string;
      phone?: string;
      profilePicture?: string;
      billingKey?: string;
    },
  ) {
    const result = await this.db
      .update(user)
      .set(userData)
      .where(eq(user.id, id))
      .returning();
    return result[0];
  }

  /**
   * 삭제 유저 본인이 하거나 또는 관리자만 할 수 있어야 한다
   * @param id
   * @returns
   */
  async hardDeleteUser(id: number) {
    const result = await this.db
      .delete(user)
      .where(eq(user.id, id))
      .returning();
    return result[0];
  }

  /**
   * 유저 본인이 소프트 삭제를 수행
   * @param id 유저 아이디
   * @returns 업데이트된 유저 정보
   */
  async softDeleteUserHimself(id: number) {
    const result = await this.db
      .update(user)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();
    return result[0];
  }

  /**
   * 관리자에 의한 유저 소프트 삭제
   * @param id 유저 아이디
   * @param adminId 관리자 아이디
   * @param reason 삭제 이유
   * @returns 업데이트된 유저 정보
   */
  async softDeleteByAdmin(id: number, adminId: number, reason: string) {
    const result = await this.db
      .update(user)
      .set({
        deletedAt: new Date(),
        deleteReason: reason,
        deletedByAdminId: adminId,
      })
      .where(eq(user.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers() {
    return await this.db.select().from(user);
  }

  /**
   * Get users with pagination and ordering
   * @param size Number of users per page
   * @param page Page number
   * @param orderBy Field to order by ('createdAt' or 'name')
   * @param orderDirection Order direction ('asc' or 'desc')
   * @returns Paginated and ordered list of users
   */
  async getUsers(
    size: number = 10,
    page: number = 1,
    orderBy: 'createdAt' | 'name' = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc',
  ) {
    const offset = (page - 1) * size;

    const query = this.db
      .select()
      .from(user)
      .orderBy(
        orderDirection === 'asc'
          ? asc(user[orderBy === 'name' ? 'name' : 'createdAt'])
          : desc(user[orderBy === 'name' ? 'name' : 'createdAt']),
      )
      .limit(size)
      .offset(offset);

    const users = await query;
    const totalCount = await this.db.select().from(user);

    return {
      users,
      metadata: {
        totalCount: Number(totalCount.length),
        page,
        size,
      },
    };
  }
}
