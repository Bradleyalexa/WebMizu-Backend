import { CustomerListParams, CreateCustomerRequest, UpdateCustomerRequest, PaginatedResponse } from '../types/api';
import { Customer } from '../types/database';
export declare const customerService: {
    list(params: CustomerListParams): Promise<PaginatedResponse<Customer>>;
    getById(id: string): Promise<Customer>;
    create(userData: CreateCustomerRequest): Promise<Customer>;
    update(id: string, updateData: UpdateCustomerRequest): Promise<Customer>;
    delete(id: string): Promise<void>;
    getFullProfile(id: string): Promise<Customer & {
        customer_products?: any[];
        orders?: any[];
        contracts?: any[];
    }>;
};
