// ResponseFormatter.js
class ResponseFormatter {
    constructor() {
        if (!ResponseFormatter.instance) {
            ResponseFormatter.instance = this;
        }
        return ResponseFormatter.instance;
    }

    formatResponse(data, message = '', status = 200, links = []) {
        return {
            data: data,
            message: message,
            status: status,
            links: links
        };
    }
}

const instance = new ResponseFormatter();
Object.freeze(instance);

export default instance;

// use case
//  res.status(status).json(responseFormatter.formatResponse(data, message, status, links));