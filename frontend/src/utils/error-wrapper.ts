import { ErrorKind, type ErrorType } from "~/lib/error";

export class ErrorWrapper extends Error {
    message: string;
    causes: string[];
    type: ErrorType; // Enforced type for error kind
    hasCause: boolean;

    constructor(message: string, causes: string[], type: ErrorType = ErrorKind.DEFAULT) {
        super(message);
        this.message = message;
        this.causes = causes;
        this.type = type; // Directly assign the type
        this.hasCause = causes.length !== 0;
    }

    static fromError(error: Error): ErrorWrapper {
        // FIXME: Handle potentially sensitive error information appropriately
        const causes = (error.cause?.errors as Error[]).map((a) => a.message);

        // Consider sanitizing error messages from external sources before exposing them:
        const sanitizedMessage = sanitizeErrorMessage(error.message);

        return new ErrorWrapper(sanitizedMessage.charAt(0).toUpperCase() + sanitizedMessage.slice(1), causes);
    }

    static fromBackendError<BackendError extends { message?: string, type: ErrorType }>(error: BackendError): ErrorWrapper {
        return new ErrorWrapper(error.message ?? "Unknown error", [], error.type);
    }
}

// Function to sanitize error messages (if necessary):
function sanitizeErrorMessage(message: string): string {
    // Implement your logic here to remove sensitive details from error messages
    // that should not be exposed to the user. This might involve redacting
    // specific error codes or database references.

    // Example (replace with your actual sanitization logic):
    return message.replace(/\d+/, 'XXX'); // Replace any digits with 'XXX' (placeholder for actual sanitization)
}
