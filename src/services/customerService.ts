import { supabase } from '../config/database'
import { CustomerListParams, CreateCustomerRequest, UpdateCustomerRequest, PaginatedResponse } from '../types/api'
import { Customer } from '../types/database'

export const customerService = {
  async list(params: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    const { search, limit = 20, offset = 0 } = params

    let query = supabase
      .from('customers')
      .select(`
        *,
        profiles!inner(email, role, name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        phone.ilike.%${search}%,
        email.ilike.%${search}%
      `)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`)
    }

    return {
      items: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    }
  },

  async getById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        profiles(email, role, name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Customer not found')
      }
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }

    return data
  },

  async create(userData: CreateCustomerRequest): Promise<Customer> {
    const { name, phone, address, address_type = 'rumah' } = userData

    // Check if phone already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingCustomer) {
      throw new Error('Phone number already exists')
    }

    // Create profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: `${phone}@webmizu.com`, // Temporary email, will be updated later
        role: 'customer',
        name
      })
      .select()
      .single()

    if (profileError || !profile) {
      throw new Error(`Failed to create profile: ${profileError?.message}`)
    }

    // Then create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        profile_id: profile.id,
        phone,
        address,
        address_type
      })
      .select(`
        *,
        profiles(email, role, name)
      `)
      .single()

    if (customerError || !customer) {
      // Rollback profile creation if customer creation fails
      await supabase.from('profiles').delete().eq('id', profile.id)
      throw new Error(`Failed to create customer: ${customerError?.message}`)
    }

    return customer
  },

  async update(id: string, updateData: UpdateCustomerRequest): Promise<Customer> {
    const { name, phone, address, address_type } = updateData

    // Get current customer to access profile_id
    const { data: currentCustomer } = await supabase
      .from('customers')
      .select('profile_id, phone')
      .eq('id', id)
      .single()

    if (!currentCustomer) {
      throw new Error('Customer not found')
    }

    // Check if phone is being changed and if new phone already exists
    if (phone && phone !== currentCustomer.phone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .neq('id', id)
        .single()

      if (existingCustomer) {
        throw new Error('Phone number already exists')
      }
    }

    // Update customer data
    const customerUpdate: any = {}
    if (phone !== undefined) customerUpdate.phone = phone
    if (address !== undefined) customerUpdate.address = address
    if (address_type !== undefined) customerUpdate.address_type = address_type

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .update(customerUpdate)
      .eq('id', id)
      .select(`
        *,
        profiles(email, role, name)
      `)
      .single()

    if (customerError) {
      throw new Error(`Failed to update customer: ${customerError.message}`)
    }

    // Update profile name if provided
    if (name) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', currentCustomer.profile_id)

      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`)
      }

      // Refresh customer data with updated profile
      const { data: refreshedCustomer } = await supabase
        .from('customers')
        .select(`
          *,
          profiles(email, role, name)
        `)
        .eq('id', id)
        .single()

      return refreshedCustomer!
    }

    return customer!
  },

  async delete(id: string): Promise<void> {
    // Check if customer has related records
    const { data: customerProducts } = await supabase
      .from('customer_products')
      .select('id')
      .eq('customer_id', id)
      .limit(1)

    if (customerProducts && customerProducts.length > 0) {
      throw new Error('Cannot delete customer with existing products')
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('profile_id')
      .eq('id', id)
      .single()

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Delete customer (will cascade to related records)
    const { error: customerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (customerError) {
      throw new Error(`Failed to delete customer: ${customerError.message}`)
    }

    // Delete associated profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', customer.profile_id)

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`)
    }
  },

  async getFullProfile(id: string): Promise<Customer & { customer_products?: any[], orders?: any[], contracts?: any[] }> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        profiles(email, role, name),
        customer_products(
          id,
          product_catalog_id,
          installation_location,
          installation_date,
          status,
          product_catalog(
            id,
            name,
            model,
            description,
            price
          )
        ),
        orders(
          id,
          order_date,
          status,
          total_amount,
          order_product(
            id,
            qty,
            price,
            subtotal,
            product_catalog(
              id,
              name,
              model,
              price
            )
          )
        ),
        customer_products(
          id,
          contracts(
            id,
            start_date,
            end_date,
            interval_months,
            total_service,
            services_used,
            status
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Customer not found')
      }
      throw new Error(`Failed to fetch customer profile: ${error.message}`)
    }

    return data
  }
}