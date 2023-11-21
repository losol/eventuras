import {
  ApiError,
  Eventuras,
  NewRegistrationDto,
  OrderLineModel,
  RegistrationDto,
} from '@losol/eventuras';

import { ApiResult, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import Logger from '@/utils/Logger';

const eventuras = new Eventuras();
export type GetEventsOptions = Parameters<typeof eventuras.events.getV3Events>[0];
export type GetEventRegistrationsOptions = Parameters<
  typeof eventuras.registrations.getV3Registrations
>[0];

export const createEventRegistration = async (
  newRegistration: NewRegistrationDto,
  selectedProducts?: Map<string, number>
): Promise<ApiResult<RegistrationDto, ApiError>> => {
  const sdk = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const products = selectedProducts
    ? (Array.from(selectedProducts, ([productId, quantity]) => ({
        productId: parseInt(productId, 10),
        quantity,
      })) as OrderLineModel[])
    : [];

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

    return apiWrapper(() =>
      sdk.registrationOrders.postV3RegistrationsProducts({
        id: parseInt(registrationId, 10),
        eventurasOrgId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
        requestBody: { lines: products },
      })
    );
  });
};
