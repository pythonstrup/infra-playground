import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { TypeConfigService } from "@shared/config/type-config.service";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AppService {
  constructor(
    private readonly http: HttpService,
    private readonly config: TypeConfigService,
  ) {}

  // --- User Service ---

  async createUser(dto: { name: string; email: string }) {
    const url = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.post(`${url}/users`, dto),
    );
    return data;
  }

  async getUsers() {
    const url = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(this.http.get(`${url}/users`));
    return data;
  }

  async getUser(id: string) {
    const url = this.config.get("USER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/users/${id}`),
    );
    return data;
  }

  // --- Order Service ---

  async createOrder(dto: {
    userId: number;
    productId: number;
    amount: number;
  }) {
    const url = this.config.get("ORDER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.post(`${url}/orders`, dto),
    );
    return data;
  }

  async getOrders() {
    const url = this.config.get("ORDER_SERVICE_URL");
    const { data } = await firstValueFrom(this.http.get(`${url}/orders`));
    return data;
  }

  async getOrder(id: string) {
    const url = this.config.get("ORDER_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/orders/${id}`),
    );
    return data;
  }

  // --- Catalog Service (Kotlin) ---

  async createProduct(dto: {
    name: string;
    description?: string;
    sku: string;
    categoryId?: number;
    weightGrams?: number;
  }) {
    const url = this.config.get("CATALOG_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.post(`${url}/api/products`, dto),
    );
    return data;
  }

  async getProducts(query: { categoryId?: string; keyword?: string }) {
    const url = this.config.get("CATALOG_SERVICE_URL");
    const params = new URLSearchParams();
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.keyword) params.set("keyword", query.keyword);
    const qs = params.toString();
    const { data } = await firstValueFrom(
      this.http.get(`${url}/api/products${qs ? `?${qs}` : ""}`),
    );
    return data;
  }

  async getProduct(id: string) {
    const url = this.config.get("CATALOG_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/api/products/${id}`),
    );
    return data;
  }

  async getCategoryTree() {
    const url = this.config.get("CATALOG_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/api/categories/tree`),
    );
    return data;
  }

  // --- Inventory Service (Kotlin) ---

  async getStock(productId: string) {
    const url = this.config.get("INVENTORY_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/api/inventory/${productId}`),
    );
    return data;
  }

  // --- Fulfillment Service (Kotlin) ---

  async createShipment(dto: { productId: number; quantity: number }) {
    const url = this.config.get("FULFILLMENT_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.post(`${url}/api/shipments`, dto),
    );
    return data;
  }

  async getShipment(id: string) {
    const url = this.config.get("FULFILLMENT_SERVICE_URL");
    const { data } = await firstValueFrom(
      this.http.get(`${url}/api/shipments/${id}`),
    );
    return data;
  }
}
