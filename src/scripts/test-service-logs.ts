import { ServiceLogRepository } from "../modules/service-logs/service-log.repository";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
    const repo = new ServiceLogRepository();
    const customerId = "f6e52442-1577-4626-bfc6-c023c089ba2d"; 
    
    console.log(`- Customer ID: ${customerId}`);
    try {
        const logs = await repo.findAll({ customerId });
        console.log(`- Found ${logs.length} logs for this customer.`);
        if (logs.length > 0) {
            logs.slice(0, 2).forEach((log, index) => {
                console.log(`Log ${index + 1}: ID=${log.id}, Date=${log.serviceDate}, Product=${log.productName}, Tech=${log.technicianName}`);
            });
        }
    } catch (e) {
        console.error("! Test failed:", e);
    }
}

test();
