import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ChangeStatusDto, CreateOrderDto, GetOrderDto } from './orders.dto';

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
    returnProcessing = 'returnprocessing'
}

@Injectable()
export class OrdersService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
      ) {}
    
    async createOrder(createOrderDto: CreateOrderDto, userId: string) {
        try {
            const {firstname, secondname, surname, number, email, postname, address, paymentmethod, cart, comment} = createOrderDto;

            console.log(cart) // [
            //     { id: 'bf53e7d1-9987-43d6-9346-962ffa401af6', quantity: 1 },
            //     { id: '189139ed-93ee-44e6-a11c-a44052ef51f7', quantity: 2 },
            //     { id: '6b200089-71d2-4e8b-9e51-2bba9396c8c0', quantity: 1 },
            //     { id: 'fe4f3ad3-e1ad-4934-b189-955abbfe4c19', quantity: 1 }
            //   ] Выглядит примерно так

            const existingOrder = await this.redisClient.keys('order:*');

            for (const orderKey of existingOrder) {
                const order = await this.redisClient.hgetall(orderKey);
                if (order.ownerId === userId && order.status == "new") {
                    return{success:false ,message:'U already have unconfirmed order (Try later)'};
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
                comment
            });

            return {success: true, orderId}
        } catch (error) {
            console.error(error)
        }
    }

    async getOrder (id: string, userId: string) {
        try {
            if (!id) {
                return { success: false, message: 'Id is undefined' };
            }

            const orderKey = `order:${id}`;
            const existingOrder = await this.redisClient.hgetall(orderKey);

            if (!existingOrder || existingOrder.ownerId != userId) {
                return {success:false, message: 'Order not found'}
            }

            return { success: true, existingOrder };
        } catch (error) {
            console.error(error)
            return {success: false, message: 'Something went wrong'}
        }
        
    }
}
