import { z } from "zod";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../schemas/task.schema";

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type TaskQueryDTO = z.infer<typeof taskQuerySchema>;
