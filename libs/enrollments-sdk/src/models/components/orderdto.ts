/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  OrderLineDto,
  OrderLineDto$inboundSchema,
  OrderLineDto$Outbound,
  OrderLineDto$outboundSchema,
} from "./orderlinedto.js";
import {
  OrderStatus,
  OrderStatus$inboundSchema,
  OrderStatus$outboundSchema,
} from "./orderstatus.js";
import {
  PaymentProvider,
  PaymentProvider$inboundSchema,
  PaymentProvider$outboundSchema,
} from "./paymentprovider.js";
import {
  RegistrationDto,
  RegistrationDto$inboundSchema,
  RegistrationDto$Outbound,
  RegistrationDto$outboundSchema,
} from "./registrationdto.js";
import {
  UserDto,
  UserDto$inboundSchema,
  UserDto$Outbound,
  UserDto$outboundSchema,
} from "./userdto.js";

export type OrderDto = {
  orderId?: number | undefined;
  status?: OrderStatus | undefined;
  time?: Date | undefined;
  userId?: string | null | undefined;
  registrationId?: number | undefined;
  paymentMethod?: PaymentProvider | undefined;
  comments?: string | null | undefined;
  log?: string | null | undefined;
  items?: Array<OrderLineDto> | null | undefined;
  registration?: RegistrationDto | undefined;
  user?: UserDto | undefined;
};

/** @internal */
export const OrderDto$inboundSchema: z.ZodType<
  OrderDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  orderId: z.number().int().optional(),
  status: OrderStatus$inboundSchema.optional(),
  time: z.string().datetime({ offset: true }).transform(v => new Date(v))
    .optional(),
  userId: z.nullable(z.string()).optional(),
  registrationId: z.number().int().optional(),
  paymentMethod: PaymentProvider$inboundSchema.optional(),
  comments: z.nullable(z.string()).optional(),
  log: z.nullable(z.string()).optional(),
  items: z.nullable(z.array(OrderLineDto$inboundSchema)).optional(),
  registration: z.lazy(() => RegistrationDto$inboundSchema).optional(),
  user: UserDto$inboundSchema.optional(),
});

/** @internal */
export type OrderDto$Outbound = {
  orderId?: number | undefined;
  status?: string | undefined;
  time?: string | undefined;
  userId?: string | null | undefined;
  registrationId?: number | undefined;
  paymentMethod?: string | undefined;
  comments?: string | null | undefined;
  log?: string | null | undefined;
  items?: Array<OrderLineDto$Outbound> | null | undefined;
  registration?: RegistrationDto$Outbound | undefined;
  user?: UserDto$Outbound | undefined;
};

/** @internal */
export const OrderDto$outboundSchema: z.ZodType<
  OrderDto$Outbound,
  z.ZodTypeDef,
  OrderDto
> = z.object({
  orderId: z.number().int().optional(),
  status: OrderStatus$outboundSchema.optional(),
  time: z.date().transform(v => v.toISOString()).optional(),
  userId: z.nullable(z.string()).optional(),
  registrationId: z.number().int().optional(),
  paymentMethod: PaymentProvider$outboundSchema.optional(),
  comments: z.nullable(z.string()).optional(),
  log: z.nullable(z.string()).optional(),
  items: z.nullable(z.array(OrderLineDto$outboundSchema)).optional(),
  registration: z.lazy(() => RegistrationDto$outboundSchema).optional(),
  user: UserDto$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OrderDto$ {
  /** @deprecated use `OrderDto$inboundSchema` instead. */
  export const inboundSchema = OrderDto$inboundSchema;
  /** @deprecated use `OrderDto$outboundSchema` instead. */
  export const outboundSchema = OrderDto$outboundSchema;
  /** @deprecated use `OrderDto$Outbound` instead. */
  export type Outbound = OrderDto$Outbound;
}

export function orderDtoToJSON(orderDto: OrderDto): string {
  return JSON.stringify(OrderDto$outboundSchema.parse(orderDto));
}

export function orderDtoFromJSON(
  jsonString: string,
): SafeParseResult<OrderDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => OrderDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OrderDto' from JSON`,
  );
}
