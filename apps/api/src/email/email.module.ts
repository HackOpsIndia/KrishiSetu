import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { AdminEmailController } from './admin-email.controller';

@Global()
@Module({
  controllers: [AdminEmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
