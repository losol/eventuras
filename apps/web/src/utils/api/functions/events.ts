import {
  ApiError,
  Eventuras,
  NewRegistrationDto,
  OrderLineModel,
  ProductDto,
  RegistrationDto,
  RegistrationUpdateDto,
} from '@eventuras/sdk';
import { Logger } from '@eventuras/utils';

import { ApiResult, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

const eventuras = new Eventuras();
export type GetEventsOptions = Parameters<typeof eventuras.events.getV3Events>[0];
export type GetEventRegistrationsOptions = Parameters<
  typeof eventuras.registrations.getV3Registrations
>[0];

export const productMapToOrderLineModel = (
  selectedProducts?: Map<string, number>
): OrderLineModel[] => {
  return selectedProducts
    ? (Array.from(selectedProducts, ([productId, quantity]) => ({
        productId: parseInt(productId, 10),
        quantity,
      })) as OrderLineModel[])
    : [];
};

export const createEventRegistration = async (
  newRegistration: NewRegistrationDto,
  selectedProducts?: Map<string, number>
): Promise<ApiResult<RegistrationDto, ApiError>> => {
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const products = productMapToOrderLineModel(selectedProducts);

  const registration = apiWrapper(() =>
    sdk.registrations.postV3Registrations({
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
      requestBody: newRegistration,
    })
  );
  Logger.info({ namespace: 'events:createEventRegistration' }, 'products selected', products);

  if (!products.length) return registration;

  return registration.then(async apiResult => {
    if (!apiResult.ok) {
      return apiResult;
    }
    const result: RegistrationDto = apiResult.value!;
    const registrationId = result.registrationId!.toString();

    return addProductsToRegistration(registrationId, products);
  });
};

export const updateEventRegistration = async (
  id: number,
  updatedRegistration: RegistrationUpdateDto,
  availableProducts: ProductDto[],
  selectedProducts?: Map<string, number>
): Promise<ApiResult<RegistrationDto, ApiError>> => {
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  /*
    we may have not selected any products, which would result in an empty map.
    However, because we are updating an existing event we may actually need to send a 'quantity:0' for
    these products, so we need to fill the map with available products, and if the map does not contain it,
    set it to 0
  */
  availableProducts.forEach((product: ProductDto) => {
    const stringyProductId = product.productId!.toString();
    if (!selectedProducts?.has(stringyProductId)) {
      selectedProducts?.set(stringyProductId, 0);
    }
  });
  const products = productMapToOrderLineModel(selectedProducts);
  const registration = apiWrapper(() =>
    sdk.registrations.putV3Registrations({
      id,
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
      requestBody: updatedRegistration,
    })
  );
  if (!products.length) return registration;

  return registration.then(async apiResult => {
    if (!apiResult.ok) {
      return apiResult;
    }
    const result: RegistrationDto = apiResult.value!;
    const registrationId = result.registrationId!.toString();

    return addProductsToRegistration(registrationId, products);
  });
};

export const addProductsToRegistration = (
  registrationId: string | number,
  products: OrderLineModel[]
) => {
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });

  return apiWrapper(() =>
    sdk.registrationOrders.postV3RegistrationsProducts({
      id: parseInt(registrationId.toString(), 10),
      eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
      requestBody: { lines: products },
    })
  );
};
