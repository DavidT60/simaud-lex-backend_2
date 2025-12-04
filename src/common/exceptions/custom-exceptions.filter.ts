import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomError extends HttpException {
  constructor(message: string, code: string, status: HttpStatus) {
    super(
      {
        statusCode: status,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
