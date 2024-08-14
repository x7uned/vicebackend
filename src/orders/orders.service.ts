import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './orders.dto';

enum OrderStatus {
  new = 'new',
  confirmed = 'confirmed',
  paid = 'paid',
  processing = 'processing',
  shipped = 'shipped',
  delivered = 'delivered',
  cancelled = 'cancelled',
  returned = 'returned',
  refunded = 'refunded',
  awaitingpayment = 'awaitingpayment',
  inWarehouse = 'inwarehouse',
  returnProcessing = 'returnprocessing',
}

@Injectable()
export class OrdersService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const {
        firstname,
        secondname,
        surname,
        number,
        email,
        postname,
        address,
        paymentmethod,
        cart,
        comment,
      } = createOrderDto;

      const existingOrder = await this.redisClient.keys('order:*');

      for (const orderKey of existingOrder) {
        const order = await this.redisClient.hgetall(orderKey);
        if (order.ownerId === userId && order.status == 'new') {
          return {
            success: false,
            message: 'U already have unconfirmed order (Try later)',
          };
        }
      }

      const serializedCart = JSON.stringify(cart);

      const orderId = uuidv4();

      await this.redisClient.hmset(`order:${orderId}`, {
        id: orderId,
        ownerId: userId,
        status: 'new',
        firstname,
        secondname,
        surname,
        number,
        email,
        postname,
        address,
        paymentmethod,
        cart: serializedCart,
        comment,
      });

      return { success: true, orderId };
    } catch (error) {
      console.error(error);
    }
  }

  async getOrder(id: string, userId: string) {
    try {
      if (!id) {
        return { success: false, message: 'Id is undefined' };
      }

      const orderKey = `order:${id}`;
      const existingOrder = await this.redisClient.hgetall(orderKey);

      if (!existingOrder || existingOrder.ownerId != userId) {
        return { success: false, message: 'Order not found' };
      }

      return { success: true, existingOrder };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Something went wrong' };
    }
  }
}
