"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const environment_1 = require("./environment");
// Create Supabase client
exports.supabase = (0, supabase_js_1.createClient)(environment_1.config.supabase.url, environment_1.config.supabase.serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Create Supabase admin client with elevated privileges
exports.supabaseAdmin = (0, supabase_js_1.createClient)(environment_1.config.supabase.url, environment_1.config.supabase.serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Database connection test
const testDatabaseConnection = async () => {
    try {
        const { data, error } = await exports.supabase
            .from('profiles')
            .select('id')
            .limit(1);
        if (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
//# sourceMappingURL=database.js.map