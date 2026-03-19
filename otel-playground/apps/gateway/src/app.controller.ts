import { AppService } from "@app/app.service";
import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- Users ---

  @Post("users")
  createUser(@Body() dto: { name: string; email: string }) {
    return this.appService.createUser(dto);
  }

  @Get("users")
  getUsers() {
    return this.appService.getUsers();
  }

  @Get("users/:id")
  getUser(@Param("id") id: string) {
    return this.appService.getUser(id);
  }

  // --- Orders ---

  @Post("orders")
  createOrder(
    @Body() dto: { userId: number; productId: number; amount: number },
  ) {
    return this.appService.createOrder(dto);
  }

  @Get("orders")
  getOrders() {
    return this.appService.getOrders();
  }

  @Get("orders/:id")
  getOrder(@Param("id") id: string) {
    return this.appService.getOrder(id);
  }

  // --- Products (Catalog Service) ---

  @Post("products")
  createProduct(
    @Body()
    dto: {
      name: string;
      description?: string;
      sku: string;
      categoryId?: number;
      weightGrams?: number;
    },
  ) {
    return this.appService.createProduct(dto);
  }

  @Get("products")
  getProducts(
    @Query("categoryId") categoryId?: string,
    @Query("keyword") keyword?: string,
  ) {
    return this.appService.getProducts({ categoryId, keyword });
  }

  @Get("products/:id")
  getProduct(@Param("id") id: string) {
    return this.appService.getProduct(id);
  }

  // --- Categories (Catalog Service) ---

  @Get("categories/tree")
  getCategoryTree() {
    return this.appService.getCategoryTree();
  }

  // --- Inventory ---

  @Get("inventory/:productId")
  getStock(@Param("productId") productId: string) {
    return this.appService.getStock(productId);
  }

  // --- Shipments (Fulfillment Service) ---

  @Post("shipments")
  createShipment(@Body() dto: { productId: number; quantity: number }) {
    return this.appService.createShipment(dto);
  }

  @Get("shipments/:id")
  getShipment(@Param("id") id: string) {
    return this.appService.getShipment(id);
  }
}
