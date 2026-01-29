import { z } from "zod";
import { createServiceLogSchema } from "../schemas/service-log.schema";

export type CreateServiceLogDTO = z.infer<typeof createServiceLogSchema>;
