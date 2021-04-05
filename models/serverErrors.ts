export class RequestError {
    message: string = "";
    details: string = "";
    error?: Error;

    constructor(message:string,details:string,error?:Error) {
        this.message = message;
        this.details = details;
        this.error = error;
    }
}