import { supabaseAdmin } from "../../db/supabase";
import { Task } from "./domain/task";
import { CreateTaskDTO, UpdateTaskDTO, TaskQueryDTO } from "./dto/task.dto";

export class TasksRepository {
  private table = "tasks" as any;

  private mapToDomain(row: any): Task {
    return {
      id: row.id,
      taskDate: row.task_date,
      customerId: row.customer_id,
      customerProductId: row.customer_product_id,
      expectedId: row.expected_id,
      technicianId: row.technician_id,
      jobId: row.job_id,
      title: row.title,
      description: row.description,
      taskType: row.task_type,
      status: row.status,
      createdAt: row.created_at,

      // Relations
      customerName: row.customers?.profiles?.name || row.customers?.name || "Unknown",
      technicianName: row.technicians?.name || "Unassigned",
      jobName: row.jobs?.name,
      address: row.customer_products?.installation_location,
      productName: row.customer_products?.product_catalog?.name,
      productModel: row.customer_products?.product_catalog?.model
    };
  }

  async findAll(query: TaskQueryDTO): Promise<{ data: Task[]; total: number }> {
    const { page, limit, search, status, technicianId, customerProductId, date } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let queryBuilder = supabaseAdmin
      .from(this.table)
      .select(`
        *,
        customers ( id, profiles(name) ),
        technicians ( name ),
        jobs ( name ),
        customer_products ( 
            installation_location,
            product_catalog ( name, model )
        )
      `, { count: "exact" });

    if (status) queryBuilder = queryBuilder.eq("status", status);
    if (technicianId) queryBuilder = queryBuilder.eq("technician_id", technicianId);
    if (query.customerProductId) queryBuilder = queryBuilder.eq("customer_product_id", query.customerProductId);
    if (date) {
        // Simple date equality check might be tricky with timestamptz, usually range is better
        // For now, assuming exact match or partial match logic if needed
        // queryBuilder = queryBuilder.eq("task_date", date); 
        // Better: check if it falls within that day
        queryBuilder = queryBuilder.gte("task_date", `${date}T00:00:00`).lte("task_date", `${date}T23:59:59`);
    }
    
    if (search) {
        // Robust search: Customer Name OR Title OR Description
        console.log("Searching Tasks for:", search);
        
        // 1. Find matching Customer IDs via Profiles
        const { data: matchingProfiles, error: profileError } = await supabaseAdmin
             .from('profiles')
             .select('id')
             .ilike('name', `%${search}%`);
        
        if (profileError) console.error("Task Search Profile Error:", profileError);
        const customerIds = matchingProfiles ? matchingProfiles.map((p: any) => p.id) : [];
        const customerIdsString = customerIds.join(',');

        let orQuery = `title.ilike.%${search}%,description.ilike.%${search}%`;
        if (customerIds.length > 0) {
            orQuery += `,customer_id.in.(${customerIdsString})`;
        }
        
        queryBuilder = queryBuilder.or(orQuery);
    }

    const { data, count, error } = await queryBuilder
      .range(from, to)
      .order("task_date", { ascending: true });

    if (error) throw error;

    return {
      data: (data || []).map(this.mapToDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Task | null> {
    const { data, error } = await supabaseAdmin
      .from(this.table)
      .select(`
        *,
        customers ( id, profiles(name) ),
        technicians ( name ),
        jobs ( name ),
        customer_products ( 
            installation_location,
            product_catalog ( name, model )
        )
      `)
      .eq("id", id)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }

  private async checkUniqueness(taskDate: string, excludeId?: string): Promise<void> {
    let query = supabaseAdmin
      .from(this.table)
      .select("id", { count: "exact", head: true })
      .eq("task_date", taskDate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { count, error } = await query;
    
    if (error) throw error;
    if (count && count > 0) {
      throw new Error(`A task with the exact time ${taskDate} already exists. Please choose a different time.`);
    }
  }

  async create(payload: CreateTaskDTO): Promise<Task> {
    await this.checkUniqueness(payload.task_date);

    const { data, error } = await supabaseAdmin
      .from(this.table)
      .insert(payload)
      .select(`
        *,
        customers ( id, profiles(name) ),
        technicians ( name ),
        jobs ( name ),
        customer_products ( installation_location )
       `)
      .single();

    if (error) throw error;
    return this.mapToDomain(data);
  }

  async update(id: string, payload: UpdateTaskDTO): Promise<Task> {
    if (payload.task_date) {
        await this.checkUniqueness(payload.task_date, id);
    }

    const { data, error } = await supabaseAdmin
      .from(this.table)
      .update(payload)
      .eq("id", id)
      .select(`
        *,
        customers ( id, profiles(name) ),
        technicians ( name ),
        jobs ( name ),
        customer_products ( installation_location )
       `)
      .single();

    if (error) throw error;
    return this.mapToDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(this.table)
      .delete()
      .eq("id", id);
      
    if (error) throw error;
  }
}
