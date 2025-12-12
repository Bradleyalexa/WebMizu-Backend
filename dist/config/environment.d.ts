export declare const config: {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly supabase: {
        readonly url: string;
        readonly anonKey: string;
        readonly serviceKey: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
    };
    readonly corsOrigins: string[];
    readonly upload: {
        readonly maxSize: number;
        readonly allowedTypes: string[];
    };
};
export type Config = typeof config;
