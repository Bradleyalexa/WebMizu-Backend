import { supabaseAdmin } from "../../db/supabase";
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from "./dto/customer.dto";
import { Customer } from "./domain/customer";
import { Database } from "@packages/types/supabase";

export class CustomerRepository {
  private supabase = supabaseAdmin;

  private mapToDomain(data: any): Customer {
    return {
      id: data.id,
      name: data.profiles?.name || "Unknown",
      email: data.profiles?.email || "",
      phone: data.phone,
      addressId: data.address_id,
      address: data.address_id && data.addresses ? data.addresses.find((a: any) => a.id === data.address_id)?.cust_address : data.addresses?.[0]?.cust_address,
      addressType: data.address_id && data.addresses ? data.addresses.find((a: any) => a.id === data.address_id)?.address_type : data.addresses?.[0]?.address_type,
      addresses: data.addresses?.map((a: any) => ({
        id: a.id,
        custAddress: a.cust_address,
        addressType: a.address_type,
        isPrimary: a.is_primary ?? false
      })) || [],
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async findAll(query: CustomerQueryDTO): Promise<{ data: Customer[]; total: number }> {
    const { page, limit, search, addressType, status } = query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // When searching, use the existing search_customers RPC which handles cross-table OR via SQL
    if (search) {
      const { data: rpcData, error: rpcError } = await (this.supabase as any)
        .rpc("search_customers", { search_text: search })
        .range(from, to);

      if (rpcError) {
        // RPC has a bug (e.g. bad column reference). Fall back to phone-only search.
        console.warn("search_customers RPC failed, falling back to phone search:", rpcError.message);
        
        const addressJoin2 = (addressType && addressType !== "all")
          ? "addresses!addresses_customer_id_fkey!inner"
          : "addresses!addresses_customer_id_fkey";

        let fallbackQuery = this.supabase.from("customers").select(
          `*, profiles!inner(name, email), ${addressJoin2}(id, cust_address, address_type, is_primary)`,
          { count: "estimated" }
        ).ilike("phone", `%${search}%`);

        if (addressType && addressType !== "all") {
          fallbackQuery = fallbackQuery.eq("addresses.address_type", addressType);
        }
        if (status && status !== "all") {
          fallbackQuery = fallbackQuery.eq("status", status);
        }

        const { data: fbData, count: fbCount, error: fbError } = await fallbackQuery
          .range(from, to)
          .order("created_at", { ascending: false });

        if (fbError) throw fbError;
        return { data: (fbData || []).map(this.mapToDomain), total: fbCount || 0 };
      }

      // RPC succeeded — map the flat row shape to domain
      const results = (rpcData || []).map((row: any): Customer => ({
        id: row.id,
        name: (row.profiles as any)?.name || "Unknown",
        email: (row.profiles as any)?.email || "",
        phone: row.phone,
        addressId: row.address_id,
        address: row.address,
        addressType: row.address_type,
        addresses: [],
        status: row.status,
        createdAt: row.created_at,
      }));

      const filtered = results.filter((c: Customer) => {
        const matchAddress = (addressType && addressType !== "all") ? c.addressType === addressType : true;
        const matchStatus = (status && status !== "all") ? c.status === status : true;
        return matchAddress && matchStatus;
      });

      return { data: filtered, total: filtered.length };
    }

    // Standard list path (no search) - uses PostgREST query builder
    const addressJoin = (addressType && addressType !== "all")
      ? "addresses!addresses_customer_id_fkey!inner"
      : "addresses!addresses_customer_id_fkey";

    const selectString = `
      *,
      profiles!inner (
        name,
        email
      ),
      ${addressJoin} (
        id,
        cust_address,
        address_type,
        is_primary
      )
    `;

    let queryBuilder = this.supabase.from("customers").select(selectString, { count: "estimated" });

    // Handle Address Type Filter
    if (addressType && addressType !== "all") {
      queryBuilder = queryBuilder.eq("addresses.address_type", addressType);
    }

    // Handle Status Filter
    if (status && status !== "all") {
      queryBuilder = queryBuilder.eq("status", status);
    }

    const { data, count, error } = await queryBuilder
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Customers Error:", error);
      throw error;
    }

    return {
      data: (data || []).map(this.mapToDomain),
      total: count || 0,
    };
  }

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from("customers")
      .select(
        `
        *,
        profiles!inner (
          name,
          email
        ),
        addresses!addresses_customer_id_fkey (
          id,
          cust_address,
          address_type,
          is_primary
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return this.mapToDomain(data);
  }
  async create(payload: CreateCustomerDTO): Promise<Customer> {
    // 0. Pre-check for duplicate phone number + name combination
    if (payload.phone) {
      const { data: existingCustomers } = await this.supabase
        .from("customers")
        .select("id, profiles!inner(name)")
        .eq("phone", payload.phone);
        
      if (existingCustomers && existingCustomers.length > 0) {
        // Check if any of these have the same name (case-insensitive and trimmed)
        const duplicate = existingCustomers.find((c: any) => 
          c.profiles?.name?.toLowerCase().trim() === payload.name.toLowerCase().trim()
        );
        
        if (duplicate) {
          throw new Error("Customer with this exact name and phone number already exists");
        }
      }
    }

    // 1. Create Auth User (Triggers handle_new_user -> creates Profile & Customer)
    const email = payload.email || `customer_${Date.now()}@webmizu.local`;
    
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: email,
      password: payload.password || "12345678", // Default password if not provided
      email_confirm: true,
      user_metadata: {
        name: payload.name, // Trigger uses this to populate profiles.name
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    const id = authData.user.id;

    try {
      // 2. Create Addresses if provided
      let primaryAddressId = null;
      
      if (payload.addresses && payload.addresses.length > 0) {
        const addressesToInsert = payload.addresses.map((a) => ({
          cust_address: a.custAddress,
          address_type: a.addressType || "rumah",
          is_primary: a.isPrimary || false,
          customer_id: id,
        }));

        const { data: insertedAddresses, error: addressError } = await this.supabase
          .from("addresses")
          .insert(addressesToInsert)
          .select();

        if (addressError) throw addressError;

        const primary = insertedAddresses.find((a) => a.is_primary) || insertedAddresses[0];
        if (primary) {
          primaryAddressId = primary.id;
        }
      } else if (payload.address) {
        // Legacy fallback
        const { data: addressData, error: addressError } = await this.supabase
          .from("addresses")
          .insert({
            cust_address: payload.address,
            address_type: payload.addressType || "rumah",
            is_primary: true,
            customer_id: id,
          })
          .select()
          .single();
        
        if (addressError) throw addressError;
        primaryAddressId = addressData.id;
      }

      // 3. Update Customer details (Trigger only created the row with ID)
      const { data, error: updateError } = await this.supabase
        .from("customers")
        .update({
          phone: payload.phone,
          address_id: primaryAddressId,
          status: payload.status,
        })
        .eq("id", id)
        .select(
          `
          *,
          profiles!inner (
            name,
            email
          ),
          addresses!addresses_customer_id_fkey (
            id,
            cust_address,
            address_type,
            is_primary
          )
        `,
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      return this.mapToDomain(data);
    } catch (error) {
      // Rollback user creation if anything fails during the process
      await this.supabase.auth.admin.deleteUser(id);
      throw error;
    }
  }

  async update(id: string, payload: UpdateCustomerDTO): Promise<Customer> {
    // 0. Pre-check for duplicate phone number + name combination on update
    if (payload.phone || payload.name) {
      let targetPhone = payload.phone;
      let targetName = payload.name;

      // If either property is missing from payload, fetch the current values
      if (!targetPhone || !targetName) {
        const { data: currentCustomer } = await this.supabase
          .from("customers")
          .select("phone, profiles!inner(name)")
          .eq("id", id)
          .single();
          
        if (currentCustomer) {
          if (!targetPhone) targetPhone = currentCustomer.phone || undefined;
          if (!targetName) targetName = (currentCustomer.profiles as any)?.name || undefined;
        }
      }

      if (targetPhone && targetName) {
        const { data: existingCustomers } = await this.supabase
          .from("customers")
          .select("id, profiles!inner(name)")
          .eq("phone", targetPhone)
          .neq("id", id);
          
        if (existingCustomers && existingCustomers.length > 0) {
          const duplicate = existingCustomers.find((c: any) => 
            c.profiles?.name?.toLowerCase().trim() === targetName!.toLowerCase().trim()
          );
          
          if (duplicate) {
            throw new Error("Another customer with this exact name and phone number already exists");
          }
        }
      }
    }

    // 1. Update Profile if name is provided (Email logic depends if we allow changing it here)
    // For now, only name update in profile. Email update involves Auth API usually.
    if (payload.name) {
      const { error: profileError } = await this.supabase
        .from("profiles")
        .update({ name: payload.name })
        .eq("id", id);

      if (profileError) throw profileError;
    }

    // 2. Handle Address update
    let primaryAddressId: string | undefined = undefined;

    if (payload.addresses) {
      const { data: existing } = await this.supabase
        .from("addresses")
        .select("id")
        .eq("customer_id", id);
      
      const existingIds = existing?.map((a) => a.id) || [];
      const incomingIds = payload.addresses.map((a) => a.id).filter(Boolean) as string[];
      const toDelete = existingIds.filter((extId) => !incomingIds.includes(extId));

      for (const addr of payload.addresses) {
        if (addr.id) {
          // Update
          const { error } = await this.supabase
            .from("addresses")
            .update({
              cust_address: addr.custAddress,
              address_type: addr.addressType || "rumah",
              is_primary: addr.isPrimary || false,
            })
            .eq("id", addr.id);
          if (error) throw error;
          if (addr.isPrimary) primaryAddressId = addr.id;
        } else {
          // Insert
          const { data: newAddr, error } = await this.supabase
            .from("addresses")
            .insert({
              cust_address: addr.custAddress,
              address_type: addr.addressType || "rumah",
              is_primary: addr.isPrimary || false,
              customer_id: id,
            })
            .select()
            .single();
            
          if (error) throw error;
          if (addr.isPrimary) primaryAddressId = newAddr.id;
        }
      }

      // If no primary address is explicitly marked but array isn't empty, pick the first existing/new id
      if (!primaryAddressId && payload.addresses.length > 0) {
         // Attempt to find current address_id of customer
         const { data: custInfo } = await this.supabase.from("customers").select("address_id").eq("id", id).single();
         if (custInfo?.address_id && incomingIds.includes(custInfo.address_id)) {
            primaryAddressId = custInfo.address_id;
         } else {
            // Unlikely to hit this properly without fetching again, but we just let address_id be if undefined
         }
      }
      
      // We must pre-update the customer's address_id pointer if it's changing or if we are deleting the current one.
      // Easiest is to update customer address_id to null or new primary, then delete removed addresses
      if (primaryAddressId !== undefined) {
         await this.supabase.from("customers").update({ address_id: primaryAddressId }).eq("id", id);
      } else if (toDelete.length > 0) {
         // Only set to null if the deleted address is the primary one, but for safety:
         await this.supabase.from("customers").update({ address_id: null }).eq("id", id);
      }

      if (toDelete.length > 0) {
        await this.supabase.from("addresses").delete().in("id", toDelete);
      }
    } else if (payload.address !== undefined || payload.addressType !== undefined) {
      // Legacy update
      const current = await this.supabase
        .from("customers")
        .select("address_id")
        .eq("id", id)
        .single();

      if (current.data?.address_id) {
        const addressUpdates: any = {};
        if (payload.address !== undefined) addressUpdates.cust_address = payload.address;
        if (payload.addressType !== undefined) addressUpdates.address_type = payload.addressType;

        const { error: addressError } = await this.supabase
          .from("addresses")
          .update(addressUpdates)
          .eq("id", current.data.address_id);

        if (addressError) throw addressError;
      } else if (payload.address) {
        const { data: addressData, error: addressError } = await this.supabase
          .from("addresses")
          .insert({
            cust_address: payload.address,
            address_type: payload.addressType || "rumah",
            is_primary: true,
            customer_id: id,
          })
          .select()
          .single();

        if (addressError) throw addressError;
        primaryAddressId = addressData.id;
      }
    }

    // 3. Update Customer fields
    const customerUpdates: any = {};
    if (payload.phone !== undefined) customerUpdates.phone = payload.phone;
    if (primaryAddressId !== undefined && payload.addresses === undefined) { 
        // If payload.addresses was provided, we already updated primaryAddressId above to avoid FK constraint issues
        customerUpdates.address_id = primaryAddressId;
    }
    if (payload.status !== undefined) customerUpdates.status = payload.status;

    if (Object.keys(customerUpdates).length > 0) {
      const { error: customerError } = await this.supabase
        .from("customers")
        .update(customerUpdates)
        .eq("id", id);

      if (customerError) throw customerError;
    }

    // 3. Return updated data
    return this.findById(id) as Promise<Customer>;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("customers")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) throw error;
  }
}
