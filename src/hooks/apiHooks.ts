import {
  EventDto,
  EventDtoPageResponseDto,
  ProductDto,
  RegistrationDtoPageResponseDto,
  UserDtoPageResponseDto,
} from '@losol/eventuras';
import { RegistrationDto } from '@losol/eventuras/models/RegistrationDto';
import { useEffect, useRef, useState } from 'react';

import {
  getEvent,
  getEventProducts,
  getEventRegistrations,
  GetEventRegistrationsOptions,
  getEvents,
  GetEventsOptions,
} from '@/utils/api/functions/events';
import { getUserRegistrations } from '@/utils/api/functions/registrations';
import { getUsers, GetUsersOptions } from '@/utils/api/functions/users';

export const useEvent = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEvent(eventRef.current.toString());
      setLoading(false);
      if (result.ok) {
        setEvent(result.value);
        return;
      }
      setEvent(null);
    };
    execute();
  }, [eventId]);
  return { loading, event };
};

export const useEvents = (options: GetEventsOptions = {}) => {
  const [response, setResponse] = useState<EventDtoPageResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEvents(options);
      setLoading(false);
      if (result.ok) {
        setResponse(result.value);
        return;
      }
      setResponse(null);
    };
    execute();
  }, [options.organizationId, options.offset, options.page]);

  return { loading, response, events: response?.data };
};
/**
 *
 * @param options GetEventRegistrationsOptions
 * @param seed use this to force reload registrations
 * @returns
 */
export const useRegistrations = (options: GetEventRegistrationsOptions = {}, seed = 0) => {
  const [response, setResponse] = useState<RegistrationDtoPageResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEventRegistrations(options);
      setLoading(false);
      if (result.ok) {
        setResponse(result.value);
        return;
      }
      setResponse(null);
    };
    execute();
  }, [options.eventId, seed]);

  return { loading, response, registrations: response?.data };
};
export const useUsers = (options: GetUsersOptions = {}) => {
  const [response, setResponse] = useState<UserDtoPageResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const execute = async () => {
      if (options.query !== undefined && options.query.length < 1) {
        //prevent network calls when query is defined but not in fact set
        return;
      }
      setLoading(true);
      const result = await getUsers(options);
      setLoading(false);
      if (result.ok) {
        setResponse(result.value);
        return;
      }
      setResponse(null);
    };
    execute();
  }, [options.query, options.offset, options.page]);
  return { loading, response, users: response?.data };
};

export const useEventProducts = (eventId: number) => {
  const eventRef = useRef(eventId);
  const [registrationProducts, setRegistrationProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getEventProducts(eventRef.current.toString());
      setLoading(false);
      if (result.ok) {
        setRegistrationProducts(result.value);
        return;
      }
      setRegistrationProducts([]);
    };
    execute();
  }, [eventId]);
  return { loading, registrationProducts };
};

export const useUserEventRegistrations = (userId?: any) => {
  const [userRegistrations, setReg] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const execute = async () => {
      const result = await getUserRegistrations(userId!);
      setLoading(false);
      if (result.ok) {
        setReg(result.value.data!);
        return;
      }
      setReg([]);
    };
    if (userId && userId.length) {
      execute();
    }
  }, [userId]);
  return { loading, userRegistrations };
};
