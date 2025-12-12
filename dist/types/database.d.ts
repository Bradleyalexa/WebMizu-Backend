export type UserRole = 'admin' | 'customer';
export type AddressType = 'apartment' | 'rumah' | 'company';
export type ProductStatus = 'active' | 'inactive' | 'tradeIn';
export type ServiceType = 'contract' | 'perpanggil';
export type ScheduleStatus = 'pending' | 'done' | 'canceled';
export type ContractStatus = 'active' | 'expired';
export type OrderStatus = 'pending' | 'paid' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';
export type TaskStatus = 'pending' | 'completed' | 'canceled';
export type SenderType = 'customer' | 'admin';
export type NotificationType = 'service' | 'contract' | 'invoice' | 'order' | 'chat' | 'system';
export type EntityType = 'schedule' | 'contract' | 'invoice' | 'order' | 'service_log' | 'chat' | 'other';
export interface Profile {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    created_at: string;
    updated_at: string;
}
export interface Customer {
    id: string;
    profile_id: string;
    phone: string;
    address?: string;
    address_type?: AddressType;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
}
export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    created_at: string;
}
export interface ProductCatalog {
    id: string;
    category_id?: string;
    name: string;
    model?: string;
    description?: string;
    price: number;
    created_at: string;
    updated_at: string;
    product_category?: ProductCategory;
}
export interface Technician {
    id: string;
    name: string;
    phone: string;
    photo_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}
export interface CustomerProduct {
    id: string;
    customer_id: string;
    product_catalog_id: string;
    order_product_id?: string;
    installation_technician_id?: string;
    photo_url?: string;
    installation_location: string;
    installation_date: string;
    notes?: string;
    status?: ProductStatus;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    product_catalog?: ProductCatalog;
    installation_technician?: Technician;
}
export interface Order {
    id: string;
    customer_id: string;
    order_date: string;
    status?: OrderStatus;
    total_amount: number;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}
export interface OrderProduct {
    id: string;
    order_id: string;
    product_catalog_id: string;
    qty: number;
    price: number;
    subtotal: number;
    created_at: string;
    order?: Order;
    product_catalog?: ProductCatalog;
}
export interface Contract {
    id: string;
    customer_product_id: string;
    start_date: string;
    end_date: string;
    interval_months: number;
    total_service: number;
    services_used?: number;
    status?: ContractStatus;
    contract_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    customer_product?: CustomerProduct;
}
export interface ScheduleExpected {
    id: string;
    customer_product_id: string;
    contract_id?: string;
    expected_date: string;
    interval_months?: number;
    source_type?: string;
    status?: ScheduleStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
    customer_product?: CustomerProduct;
    contract?: Contract;
}
export interface ServiceLog {
    id: string;
    expected_id?: string;
    customer_product_id: string;
    technician_id: string;
    service_date: string;
    service_type: ServiceType;
    pekerjaan: string;
    harga_service?: number;
    teknisi_fee?: number;
    job_evidence?: string[];
    notes?: string;
    created_at: string;
    updated_at: string;
    expected?: ScheduleExpected;
    customer_product?: CustomerProduct;
    technician?: Technician;
}
export interface Invoice {
    id: string;
    customer_id: string;
    related_type: string;
    related_id?: string;
    invoice_number: string;
    total_amount: number;
    pdf_url?: string;
    status?: InvoiceStatus;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}
export interface Task {
    id: string;
    task_date: string;
    customer_id?: string;
    customer_product_id?: string;
    expected_id?: string;
    technician_id?: string;
    task_type: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    customer_product?: CustomerProduct;
    expected?: ScheduleExpected;
    technician?: Technician;
}
export interface ChatMessage {
    id: string;
    customer_id: string;
    sender_type: SenderType;
    message: string;
    attachments?: string[];
    created_at: string;
    customer?: Customer;
}
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    entity_type?: EntityType;
    entity_id?: string;
    is_read?: boolean;
    created_at: string;
    profile?: Profile;
}
