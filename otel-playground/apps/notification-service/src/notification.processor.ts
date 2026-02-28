import { HttpService } from '@nestjs/axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { TypeConfigService } from '@shared/config/type-config.service';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';
import { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';

interface OrderNotificationJob {
  readonly orderId: number;
  readonly userId: number;
  readonly product: string;
  readonly amount: number;
}

@Processor('order-notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
  }

  async process(job: Job<OrderNotificationJob>): Promise<void> {
    const { userId, product, amount } = job.data;

    const userServiceUrl = this.config.get('USER_SERVICE_URL');
    const { data: user } = await firstValueFrom(this.http.get(`${userServiceUrl}/users/${userId}`));

    // Simulate external API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`[SMS] To: ${user.email} — 주문 확인: ${product} (${amount}원)`, NotificationProcessor.name);
  }
}
