import { Logger } from '@eventuras/logger';

import {
  NewRegistrationDto,
  OrderLineModel,
  postV3Registrations,
  postV3RegistrationsByIdProducts,
  ProductDto,
  putV3RegistrationsById,
  RegistrationDto,
  RegistrationUpdateDto,
} from '@/lib/eventuras-sdk';
import { getOrganizationId } from '@/utils/organization';
import { productMapToOrderLineModel } from '@/utils/registration-helpers';

const logger = Logger.create({ namespace: 'web:utils:api', context: { module: 'events' } });

// Re-export for backwards compatibility
export { productMapToOrderLineModel };

export const createEventRegistration = async (
  newRegistration: NewRegistrationDto,
  selectedProducts?: Map<string, number>
): Promise<RegistrationDto | null> => {
  const products = productMapToOrderLineModel(selectedProducts);
  const orgId = getOrganizationId();

  if (!orgId || isNaN(orgId)) {
    logger.error('Organization ID is not configured or invalid');
    throw new Error('Organization ID is required');
  }

  const registrationResponse = await postV3Registrations({
    headers: { 'Eventuras-Org-Id': orgId },
    body: newRegistration,
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
  const orgId = getOrganizationId();

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
  const orgId = getOrganizationId();

  const response = await postV3RegistrationsByIdProducts({
    path: { id: parseInt(registrationId.toString(), 10) },
    headers: { 'Eventuras-Org-Id': orgId },
    body: { lines: products },
  });

  if (!response.data) {
    logger.error({ error: response.error }, 'Failed to add products to registration');
    return null;
  }

  return response.data;
};
