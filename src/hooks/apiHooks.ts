import {
  EventDto,
  EventDtoPageResponseDto,
  ProductDto,
  UserDtoPageResponseDto,
} from '@losol/eventuras';
import { RegistrationDto } from '@losol/eventuras/models/RegistrationDto';
import { useEffect, useRef, useState } from 'react';

import {
  getEvent,
  getEventProducts,
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
  }, []);
  return { loading, event };
};

export const useEvents = (options: GetEventsOptions = {}) => {
  const [response, setResponse] = useState<EventDtoPageResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const execute = async () => {
      const result = await getEvents(optionsRef.current);
      setLoading(false);
      if (result.ok) {
        setResponse(result.value);
        return;
      }
      setResponse(null);
    };
    execute();
  }, []);

  return { loading, response, events: response?.data };
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
  }, [options]);
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
  }, []);
  return { loading, registrationProducts };
};

export const useEventRegistrations = (userId?: any) => {
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
