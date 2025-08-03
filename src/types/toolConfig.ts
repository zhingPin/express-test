export interface ToolConfig<T = any> {
    definition: {
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: {
                type: "object";
                properties: Record<string, unknown>;
                required: string[];
            };
        };
        //   isEnabled: boolean; // Whether the tool is active
    };
    isEnabled?: boolean; // Whether the tool is active
    version?: string; // Optional version of the tool
    metadata?: Record<string, any>; // Optional metadata for additional details
    category?: string; // Optional category of the tool
    handler: (args: T) => Promise<any>;
}