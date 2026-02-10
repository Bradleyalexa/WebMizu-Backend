import { z } from "zod";
import {
  scheduleQuerySchema,
  createScheduleSchema,
  updateScheduleSchema,
} from "../schemas/schedule.schema";

export type CreateScheduleDTO = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDTO = z.infer<typeof updateScheduleSchema>;
export type ScheduleQueryDTO = z.infer<typeof scheduleQuerySchema>;
