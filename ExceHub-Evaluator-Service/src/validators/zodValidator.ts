import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
    (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({ ...req.body });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.format(),
                data: {},
            });
        }

        // ✅ overwrite body with validated & typed data
        req.body = result.data;

        next();
    };
