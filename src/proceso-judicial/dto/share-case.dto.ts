import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ShareCaseDto {
  @ApiProperty({ 
    example: 'recipient@example.com', 
    description: 'Email address of the recipient' 
  })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ 
    example: 'Please review this case result.', 
    description: 'Optional message to include in the email',
    required: false
  })
  @IsOptional()
  @IsString()
  message?: string;
}
