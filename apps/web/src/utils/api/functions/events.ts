import {
  NewRegistrationDto,
  OrderLineModel,
  ProductDto,
  RegistrationDto,
  RegistrationUpdateDto,
  postV3Registrations,
  postV3RegistrationsByIdProducts,
  putV3RegistrationsById,
} from '@eventuras/event-sdk';
import { Logger } from '@eventuras/logger';

const logger = Logger.create({ namespace: 'web:utils:api', context: { module: 'events' } });

import { createClient } from '@/utils/apiClient';
import { publicEnv } from '@/config.client';


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
): Promise<RegistrationDto | null> => {
  const client = await createClient();
  const products = productMapToOrderLineModel(selectedProducts);
  const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;

  if (!orgId || isNaN(orgId)) {
    logger.error('Organization ID is not configured or invalid');
    throw new Error('Organization ID is required');
  }

  const registrationResponse = await postV3Registrations({
    headers: { 'Eventuras-Org-Id': orgId },
    body: newRegistration,
    client,
  });

  if (!registrationResponse.data) {
    logger.error({ error: registrationResponse.error }, 'Failed to create registration');
    return null;
  }

  logger.info({ products }, 'products selected for registration');

  if (!products.length) {
    return registrationResponse.data;
  }

  // Add products to the registration
  const registrationId = registrationResponse.data.registrationId!;
  const productsResponse = await addProductsToRegistration(registrationId, products);

  return productsResponse;
};

export const updateEventRegistration = async (
  id: number,
  updatedRegistration: RegistrationUpdateDto,
  availableProducts: ProductDto[],
  selectedProducts?: Map<string, number>
): Promise<RegistrationDto | null> => {
  const client = await createClient();
  const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;

  if (!orgId || isNaN(orgId)) {
    logger.error('Organization ID is not configured or invalid');
    throw new Error('Organization ID is required');
  }

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

  const registrationResponse = await putV3RegistrationsById({
    path: { id },
    headers: { 'Eventuras-Org-Id': orgId },
    body: updatedRegistration,
    client,
  });

  if (!registrationResponse.data) {
    logger.error({ error: registrationResponse.error }, 'Failed to update registration');
    return null;
  }

  if (!products.length) {
    return registrationResponse.data;
  }

  const registrationId = registrationResponse.data.registrationId!;
  return addProductsToRegistration(registrationId, products);
};

export const addProductsToRegistration = async (
  registrationId: string | number,
  products: OrderLineModel[]
): Promise<RegistrationDto | null> => {
  const client = await createClient();
  const orgId = publicEnv.NEXT_PUBLIC_ORGANIZATION_ID;

  if (!orgId || isNaN(orgId)) {
    logger.error('Organization ID is not configured or invalid');
    throw new Error('Organization ID is required');
  }

  const response = await postV3RegistrationsByIdProducts({
    path: { id: parseInt(registrationId.toString(), 10) },
    headers: { 'Eventuras-Org-Id': orgId },
    body: { lines: products },
    client,
  });

  if (!response.data) {
    logger.error({ error: response.error }, 'Failed to add products to registration');
    return null;
  }

  return response.data;
};
