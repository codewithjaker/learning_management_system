//@ts-nocheck
import { db } from "../db";
import { coupons } from "../db/schema/coupons";
import { courses } from "../db/schema/courses";
import {
  eq,
  and,
  like,
  desc,
  asc,
  count,
  sql,
  gte,
  lte,
  or,
  ne,
} from "drizzle-orm";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors";
import type {
  CreateCouponInput,
  UpdateCouponInput,
} from "../validations/coupon";
import type { Coupon } from "../db/schema/coupons";

export class CouponService {
  // Check if coupon code already exists (for create/update)
  private async ensureCodeUnique(
    code: string,
    excludeId?: number,
  ): Promise<void> {
    const query = db.select().from(coupons).where(eq(coupons.code, code));
    if (excludeId) {
      query.where(ne(coupons.id, excludeId)); // we'll handle via sql
    }
    const existing = await query.limit(1);
    if (existing.length > 0 && (!excludeId || existing[0].id !== excludeId)) {
      throw new BadRequestError("Coupon code already exists");
    }
  }

  // Check if course exists (if courseId provided)
  private async ensureCourseExists(courseId?: number | null): Promise<void> {
    if (!courseId) return;
    const [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new BadRequestError("Course not found");
  }

  // Validate date range
  private validateDates(validFrom: string, validUntil: string): void {
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    if (from >= until) {
      throw new BadRequestError("validFrom must be before validUntil");
    }
  }

  //   async createCoupon(data: CreateCouponInput): Promise<Coupon> {
  //     await this.ensureCodeUnique(data.code);
  //     await this.ensureCourseExists(data.courseId);
  //     this.validateDates(data.validFrom, data.validUntil);

  //     const [coupon] = await db
  //       .insert(coupons)
  //       .values({
  //         ...data,
  //         usedCount: 0,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //       })
  //       .returning();

  //     return coupon;
  //   }
  async createCoupon(data: CreateCouponInput): Promise<Coupon> {
    await this.ensureCodeUnique(data.code);
    await this.ensureCourseExists(data.courseId);
    this.validateDates(data.validFrom, data.validUntil);

    const [coupon] = await db
      .insert(coupons)
      .values({
        ...data,
        // Convert ISO strings to Date objects
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return coupon;
  }

  async getAllCoupons(params: {
    page?: number;
    limit?: number;
    code?: string;
    courseId?: number;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: Coupon[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (params.code) {
      whereConditions.push(like(coupons.code, `%${params.code}%`));
    }
    if (params.courseId) {
      whereConditions.push(eq(coupons.courseId, params.courseId));
    } else if (params.courseId === null) {
      whereConditions.push(sql`${coupons.courseId} IS NULL`);
    }
    if (params.isActive !== undefined) {
      whereConditions.push(eq(coupons.isActive, params.isActive));
    }
    if (params.validFrom) {
      whereConditions.push(gte(coupons.validFrom, new Date(params.validFrom)));
    }
    if (params.validUntil) {
      whereConditions.push(
        lte(coupons.validUntil, new Date(params.validUntil)),
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(coupons)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case "code":
          return coupons.code;
        case "value":
          return coupons.value;
        case "validFrom":
          return coupons.validFrom;
        case "validUntil":
          return coupons.validUntil;
        default:
          return coupons.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === "desc" ? desc : asc;

    const data = await db
      .select()
      .from(coupons)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getCouponById(id: number): Promise<Coupon> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    if (!coupon) throw new NotFoundError("Coupon");
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);
    return coupon || null;
  }

  //   async updateCoupon(id: number, data: UpdateCouponInput): Promise<Coupon> {
  //     const existing = await this.getCouponById(id);

  //     if (data.code && data.code !== existing.code) {
  //       await this.ensureCodeUnique(data.code, id);
  //     }
  //     if (data.courseId !== undefined) {
  //       await this.ensureCourseExists(data.courseId);
  //     }
  //     if (data.validFrom && data.validUntil) {
  //       this.validateDates(data.validFrom, data.validUntil);
  //     } else if (data.validFrom) {
  //       this.validateDates(data.validFrom, existing.validUntil.toISOString());
  //     } else if (data.validUntil) {
  //       this.validateDates(existing.validFrom.toISOString(), data.validUntil);
  //     }

  //     const [updated] = await db
  //       .update(coupons)
  //       .set({
  //         ...data,
  //         updatedAt: new Date(),
  //       })
  //       .where(eq(coupons.id, id))
  //       .returning();

  //     return updated;
  //   }

  async updateCoupon(id: number, data: UpdateCouponInput): Promise<Coupon> {
    const existing = await this.getCouponById(id);

    if (data.code && data.code !== existing.code) {
      await this.ensureCodeUnique(data.code, id);
    }
    if (data.courseId !== undefined) {
      await this.ensureCourseExists(data.courseId);
    }
    if (data.validFrom && data.validUntil) {
      this.validateDates(data.validFrom, data.validUntil);
    } else if (data.validFrom) {
      this.validateDates(data.validFrom, existing.validUntil.toISOString());
    } else if (data.validUntil) {
      this.validateDates(existing.validFrom.toISOString(), data.validUntil);
    }

    // Prepare update object with proper date conversion
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil);

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();

    return updated;
  }

  async deleteCoupon(id: number): Promise<void> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    if (result.rowCount === 0) throw new NotFoundError("Coupon");
  }

  /**
   * Validate a coupon for a given course.
   * Returns the coupon if valid, otherwise throws an error.
   */
  async validateCoupon(code: string, courseId?: number): Promise<Coupon> {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) throw new NotFoundError("Coupon");

    const now = new Date();

    // Check active
    if (!coupon.isActive) {
      throw new BadRequestError("Coupon is inactive");
    }

    // Check date range
    if (now < coupon.validFrom) {
      throw new BadRequestError("Coupon is not yet valid");
    }
    if (now > coupon.validUntil) {
      throw new BadRequestError("Coupon has expired");
    }

    // Check max uses
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestError("Coupon usage limit exceeded");
    }

    // Check course applicability
    if (coupon.courseId !== null) {
      if (!courseId || coupon.courseId !== courseId) {
        throw new BadRequestError("Coupon is not applicable to this course");
      }
    }
    // If coupon.courseId is null, it's global – applicable to any course

    return coupon;
  }

  /**
   * Increment the usage count of a coupon.
   * Called when a coupon is successfully applied to an invoice.
   */
  async useCoupon(id: number): Promise<Coupon> {
    const coupon = await this.getCouponById(id);
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestError("Coupon usage limit already reached");
    }

    const [updated] = await db
      .update(coupons)
      .set({
        usedCount: coupon.usedCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id))
      .returning();

    return updated;
  }
}

export const couponService = new CouponService();
