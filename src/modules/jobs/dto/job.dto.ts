import { z } from "zod";
import { jobQuerySchema, createJobSchema, updateJobSchema } from "../schemas/job.schema";

export type CreateJobDTO = z.infer<typeof createJobSchema>;
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
export type JobQueryDTO = z.infer<typeof jobQuerySchema>;
