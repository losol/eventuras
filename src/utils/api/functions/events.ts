import { EventsService } from '@losol/eventuras';
import { EventDto } from '@losol/eventuras/models/EventDto';
import { EventDtoPageResponseDto } from '@losol/eventuras/models/EventDtoPageResponseDto';
import { EventFormDto } from '@losol/eventuras/models/EventFormDto';
import { NewRegistrationDto } from '@losol/eventuras/models/NewRegistrationDto';
import { ProductDto } from '@losol/eventuras/models/ProductDto';
import { RegistrationDto } from '@losol/eventuras/models/RegistrationDto';

import Logger from '@/utils/Logger';

import apiFetch from '../apiFetch';
import ApiResult from '../ApiResult';
import ApiURLs from '../ApiUrls';

export type GetEventsOptions = Parameters<typeof EventsService.getV3Events>[0];

export const createEventRegistration = async (
  newRegistration: NewRegistrationDto,
  selectedProducts?: Map<string, number>
) => {
  const products = selectedProducts
    ? Array.from(selectedProducts, ([productId, quantity]) => ({
        productId,
        quantity,
      }))
    : [];

  const registration = apiFetch(ApiURLs.registrations(), {
    method: 'POST',
    body: JSON.stringify(newRegistration),
  });
  Logger.info({ namespace: 'events:createEventRegistration' }, 'products selected', products);

  if (!products.length) return registration;

  return registration.then(async (apiResult: ApiResult<RegistrationDto>) => {
    if (!apiResult.ok) {
      return apiResult;
    }
    const result: RegistrationDto = apiResult.value;
    const registrationId = result.registrationId!.toString();
    return await apiFetch(ApiURLs.products({ registrationId }), {
      method: 'POST',
      body: JSON.stringify({
        lines: products,
      }),
    });
  });
};
export const createEvent = (formValues: EventFormDto): Promise<ApiResult<EventDto>> =>
  apiFetch(ApiURLs.events(), { method: 'POST', body: JSON.stringify(formValues) });
export const updateEvent = (
  eventId: string,
  formValues: EventFormDto
): Promise<ApiResult<EventDto>> =>
  apiFetch(ApiURLs.event({ eventId }), { method: 'PUT', body: JSON.stringify(formValues) });
export const getEvents = (
  options: GetEventsOptions = {}
): Promise<ApiResult<EventDtoPageResponseDto>> => apiFetch(ApiURLs.events(options));
export const getEvent = (eventId: string): Promise<ApiResult<EventDto>> =>
  apiFetch(ApiURLs.event({ eventId }));
export const getEventProducts = (eventId: string): Promise<ApiResult<ProductDto[]>> =>
  apiFetch(ApiURLs.eventProducts({ eventId }));
