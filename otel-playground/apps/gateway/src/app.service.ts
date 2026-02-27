import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { TypeConfigService } from "@shared/config/type-config.service";

@Injectable()
export class AppService {
  constructor(
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
  ) {}

  async getUsers() {
    const userServiceUrl = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${userServiceUrl}/users`),
    );
    return data;
  }

  async getUser(id: string) {
    const userServiceUrl = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${userServiceUrl}/users/${id}`),
    );
    return data;
  }

  async getOrders() {
    const orderServiceUrl = this.config.get("ORDER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${orderServiceUrl}/orders`),
    );
    return data;
  }

  async getOrder(id: string) {
    const orderServiceUrl = this.config.get("ORDER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${orderServiceUrl}/orders/${id}`),
    );
    return data;
  }
}
