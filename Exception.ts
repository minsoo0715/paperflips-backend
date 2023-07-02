class Exception extends Error {

    status: number;

    constructor(message: string, status: number) {
        super(message)
        this.name = "Exception"
        this.status = status;
    }
}

export default Exception;