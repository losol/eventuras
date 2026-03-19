'use server';

import { revalidatePath } from 'next/cache';

import {
  actionError,
  actionSuccess,
  type ServerActionResult,
} from '@eventuras/core-nextjs/actions';
import { Logger } from '@eventuras/logger';

import { client } from '@/lib/eventuras-client';
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

const logger = Logger.create({
  namespace: 'web:user:events',
  context: { module: 'actions' },
});

type ApiResponseWithError = {
  error?: unknown;
  response?: unknown;
};

function getApiErrorDetails(response: ApiResponseWithError) {
  const apiResponse = response.response as { status?: number; statusText?: string } | undefined;

  return {
    responseStatus: apiResponse?.status,
    responseStatusText: apiResponse?.statusText,
    error: response.error,
  };
}

function getSelectedProductSummary(selectedProducts?: Map<string, number>) {
  return {
    selectedProductCount: selectedProducts?.size ?? 0,
  };
}

/**
 * Add products to a registration
 */
async function addProductsToRegistration(
  registrationId: number,
  products: OrderLineModel[],
  context?: {
    eventId?: number;
    userId?: string;
    source?: 'create' | 'update' | 'edit-existing';
  }
): Promise<RegistrationDto | null> {
  const orgId = getOrganizationId();

  logger.debug(
    {
      registrationId,
      organizationId: orgId,
      productCount: products.length,
      ...context,
    },
    'Adding products to registration'
  );

  const response = await postV3RegistrationsByIdProducts({
    client,
    path: { id: registrationId },
    headers: { 'Eventuras-Org-Id': orgId },
    body: { lines: products },
  });

  if (!response.data) {
    logger.error(
      {
        registrationId,
        organizationId: orgId,
        productCount: products.length,
        ...context,
        ...getApiErrorDetails(response),
      },
      'Failed to add products to registration'
    );
    return null;
  }

  logger.debug(
    {
      registrationId,
      organizationId: orgId,
      productCount: products.length,
      ...context,
    },
    'Products added successfully'
  );
  return response.data;
}

/**
 * Create a new event registration with optional products
 */
export async function createEventRegistration(
  newRegistration: NewRegistrationDto,
  selectedProducts?: Map<string, number>
): Promise<ServerActionResult<RegistrationDto>> {
  const orgId = getOrganizationId();
  const products = productMapToOrderLineModel(selectedProducts);

  logger.debug(
    {
      organizationId: orgId,
      userId: newRegistration.userId,
      eventId: newRegistration.eventId,
      paymentMethod: newRegistration.paymentMethod,
      productCount: products.length,
      ...getSelectedProductSummary(selectedProducts),
    },
    'Creating event registration'
  );

  try {
    const registrationResponse = await postV3Registrations({
      client,
      headers: { 'Eventuras-Org-Id': orgId },
      body: newRegistration,
    });

    if (!registrationResponse.data) {
      logger.error(
        {
          organizationId: orgId,
          userId: newRegistration.userId,
          eventId: newRegistration.eventId,
          paymentMethod: newRegistration.paymentMethod,
          productCount: products.length,
          ...getSelectedProductSummary(selectedProducts),
          ...getApiErrorDetails(registrationResponse),
        },
        'Failed to create registration'
      );
      return actionError('Failed to create registration');
    }

    logger.debug(
      {
        organizationId: orgId,
        registrationId: registrationResponse.data.registrationId,
        eventId: newRegistration.eventId,
        userId: newRegistration.userId,
      },
      'Registration created successfully'
    );

    // If no products, return the registration
    if (!products.length) {
      revalidatePath(`/user/events/${newRegistration.eventId}`);
      revalidatePath(`/admin/events/${newRegistration.eventId}`);
      return actionSuccess(registrationResponse.data, 'Registration created successfully!');
    }

    // Add products to the registration
    const registrationId = registrationResponse.data.registrationId!;
    const registrationWithProducts = await addProductsToRegistration(registrationId, products, {
      eventId: newRegistration.eventId,
      userId: newRegistration.userId,
      source: 'create',
    });

    if (!registrationWithProducts) {
      logger.error(
        {
          organizationId: orgId,
          registrationId,
          eventId: newRegistration.eventId,
          userId: newRegistration.userId,
          productCount: products.length,
        },
        'Registration created but failed while adding products'
      );
      return actionError('Registration created but failed to add products');
    }

    revalidatePath(`/user/events/${newRegistration.eventId}`);
    revalidatePath(`/admin/events/${newRegistration.eventId}`);
    return actionSuccess(registrationWithProducts, 'Registration created successfully!');
  } catch (error) {
    logger.error(
      {
        error,
        organizationId: orgId,
        userId: newRegistration.userId,
        eventId: newRegistration.eventId,
        paymentMethod: newRegistration.paymentMethod,
        productCount: products.length,
        ...getSelectedProductSummary(selectedProducts),
      },
      'Unexpected error creating registration'
    );
    return actionError('An unexpected error occurred');
  }
}

/**
 * Update an existing event registration with optional products
 */
export async function updateEventRegistration(
  id: number,
  updatedRegistration: RegistrationUpdateDto,
  availableProducts: ProductDto[],
  selectedProducts?: Map<string, number>
): Promise<ServerActionResult<RegistrationDto>> {
  const orgId = getOrganizationId();

  logger.debug(
    {
      organizationId: orgId,
      registrationId: id,
      paymentMethod: updatedRegistration.paymentMethod,
      availableProductCount: availableProducts.length,
      ...getSelectedProductSummary(selectedProducts),
    },
    'Updating event registration'
  );

  let products: OrderLineModel[] = [];

  try {
    /*
      We may have not selected any products, which would result in an empty map.
      However, because we are updating an existing event we may actually need to send a 'quantity:0' for
      these products, so we need to fill the map with available products, and if the map does not contain it,
      set it to 0
    */
    availableProducts.forEach((product: ProductDto) => {
      if (product.productId == null) {
        logger.warn(
          {
            organizationId: orgId,
            registrationId: id,
            product,
          },
          'Skipping product without productId while updating registration'
        );
        return;
      }

      const stringyProductId = product.productId.toString();
      if (!selectedProducts?.has(stringyProductId)) {
        selectedProducts?.set(stringyProductId, 0);
      }
    });

    products = productMapToOrderLineModel(selectedProducts);

    const registrationResponse = await putV3RegistrationsById({
      client,
      path: { id },
      headers: { 'Eventuras-Org-Id': orgId },
      body: updatedRegistration,
    });

    if (!registrationResponse.data) {
      logger.error(
        {
          organizationId: orgId,
          registrationId: id,
          paymentMethod: updatedRegistration.paymentMethod,
          productCount: products.length,
          availableProductCount: availableProducts.length,
          ...getSelectedProductSummary(selectedProducts),
          ...getApiErrorDetails(registrationResponse),
        },
        'Failed to update registration'
      );
      return actionError('Failed to update registration');
    }

    logger.debug(
      { organizationId: orgId, registrationId: id },
      'Registration updated successfully'
    );

    // If no products, return the registration
    if (!products.length) {
      revalidatePath(`/user/events`);
      return actionSuccess(registrationResponse.data, 'Registration updated successfully!');
    }

    // Update products for the registration
    const registrationId = registrationResponse.data.registrationId!;
    const registrationWithProducts = await addProductsToRegistration(registrationId, products, {
      eventId: registrationResponse.data.eventId,
      userId: registrationResponse.data.userId ?? undefined,
      source: 'update',
    });

    if (!registrationWithProducts) {
      logger.error(
        {
          organizationId: orgId,
          registrationId,
          eventId: registrationResponse.data.eventId,
          userId: registrationResponse.data.userId ?? undefined,
          productCount: products.length,
        },
        'Registration updated but failed while updating products'
      );
      return actionError('Registration updated but failed to update products');
    }

    revalidatePath(`/user/events`);
    return actionSuccess(registrationWithProducts, 'Registration updated successfully!');
  } catch (error) {
    logger.error(
      {
        error,
        organizationId: orgId,
        registrationId: id,
        paymentMethod: updatedRegistration.paymentMethod,
        productCount: products.length,
        availableProductCount: availableProducts.length,
        ...getSelectedProductSummary(selectedProducts),
      },
      'Unexpected error updating registration'
    );
    return actionError('An unexpected error occurred');
  }
}

/**
 * Add products to an existing registration (for editing orders)
 */
export async function addProductsToExistingRegistration(
  registrationId: number,
  selectedProducts: Map<string, number>
): Promise<ServerActionResult<RegistrationDto>> {
  logger.debug(
    { registrationId, ...getSelectedProductSummary(selectedProducts) },
    'Adding products to existing registration'
  );

  try {
    const products = productMapToOrderLineModel(selectedProducts);

    if (!products.length) {
      logger.warn({ registrationId }, 'No products to add');
      return actionError('No products selected');
    }

    const registrationWithProducts = await addProductsToRegistration(registrationId, products, {
      source: 'edit-existing',
    });

    if (!registrationWithProducts) {
      logger.error(
        {
          registrationId,
          productCount: products.length,
          ...getSelectedProductSummary(selectedProducts),
        },
        'Failed to add products to existing registration'
      );
      return actionError('Failed to add products to registration');
    }

    // Revalidate both user and admin event pages
    if (registrationWithProducts.eventId) {
      revalidatePath(`/user/events/${registrationWithProducts.eventId}`);
      revalidatePath(`/admin/events/${registrationWithProducts.eventId}`);
    }
    revalidatePath(`/admin/registrations`);
    revalidatePath(`/user/events`);

    return actionSuccess(registrationWithProducts, 'Products added successfully!');
  } catch (error) {
    logger.error(
      {
        error,
        registrationId,
        ...getSelectedProductSummary(selectedProducts),
      },
      'Unexpected error adding products to existing registration'
    );
    return actionError('An unexpected error occurred');
  }
}
