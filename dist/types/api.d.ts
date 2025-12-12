export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: ApiError | null;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
export interface PaginationParams {
    limit?: number;
    offset?: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
export interface AuthUser {
    id: string;
    email: string;
    role: 'admin' | 'customer';
    name: string;
}
export interface LoginRequest {
    phone_or_email: string;
    password: string;
}
export interface LoginResponse {
    user: AuthUser;
    token: string;
    expiresIn: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone: string;
    address?: string;
    address_type?: 'apartment' | 'rumah' | 'company';
}
export interface CreateCustomerRequest {
    name: string;
    phone: string;
    address?: string;
    address_type?: 'apartment' | 'rumah' | 'company';
}
export interface UpdateCustomerRequest {
    name?: string;
    phone?: string;
    address?: string;
    address_type?: 'apartment' | 'rumah' | 'company';
}
export interface CreateProductCategoryRequest {
    name: string;
    description?: string;
}
export interface CreateProductCatalogRequest {
    category_id?: string;
    name: string;
    model?: string;
    description?: string;
    price: number;
}
export interface CreateCustomerProductRequest {
    customer_id: string;
    product_catalog_id: string;
    order_product_id?: string;
    installation_technician_id?: string;
    photo_url?: string;
    installation_location: string;
    installation_date: string;
    notes?: string;
    status?: 'active' | 'inactive' | 'tradeIn';
}
export interface CreateContractRequest {
    customer_product_id: string;
    start_date: string;
    end_date: string;
    interval_months: number;
    total_service: number;
    contract_url?: string;
    notes?: string;
}
export interface CreateServiceLogRequest {
    expected_id?: string;
    customer_product_id: string;
    technician_id: string;
    service_date: string;
    service_type: 'contract' | 'perpanggil';
    pekerjaan: string;
    harga_service?: number;
    teknisi_fee?: number;
    job_evidence?: string[];
    notes?: string;
}
export interface CreateTaskRequest {
    task_date: string;
    customer_id?: string;
    customer_product_id?: string;
    expected_id?: string;
    technician_id?: string;
    task_type: string;
    title: string;
    description?: string;
    status?: 'pending' | 'completed' | 'canceled';
}
export interface CreateTechnicianRequest {
    name: string;
    phone: string;
    photo_url?: string;
    notes?: string;
}
export interface CreateInvoiceRequest {
    customer_id: string;
    related_type: 'order' | 'contract' | 'service' | 'other';
    related_id?: string;
    invoice_number?: string;
    total_amount: number;
    meta?: {
        notes?: string;
    };
}
export interface SendMessageRequest {
    thread_id?: string;
    message: string;
    attachment?: File;
}
export interface CustomerListParams extends PaginationParams {
    search?: string;
}
export interface ProductListParams extends PaginationParams {
    search?: string;
    category_id?: string;
}
export interface CustomerProductListParams extends PaginationParams {
    customer_id?: string;
    status?: string;
}
export interface ContractListParams extends PaginationParams {
    customer_product_id?: string;
    status?: string;
}
export interface ServiceLogListParams extends PaginationParams {
    customer_product_id?: string;
    technician_id?: string;
    date_from?: string;
    date_to?: string;
    service_type?: string;
}
export interface TaskListParams extends PaginationParams {
    date_from?: string;
    date_to?: string;
    technician_id?: string;
    status?: string;
    customer_id?: string;
}
export interface InvoiceListParams extends PaginationParams {
    customer_id?: string;
    related_type?: string;
    status?: string;
}
export interface OrderListParams extends PaginationParams {
    customer_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}
export interface ScheduleListParams extends PaginationParams {
    customer_product_id?: string;
    contract_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}
export interface TechnicianListParams extends PaginationParams {
    search?: string;
}
