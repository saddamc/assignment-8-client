import { z } from "zod";

export const zodValidator = <T>(payload: T, schema: z.ZodSchema<T>) => {
    try {
        const validatedPayload = schema.parse(payload);
        return { success: true, data: validatedPayload };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.issues,
            };
        }
        return { success: false, errors: "Validation failed" };
    }
}
