/**
 * Taken from the generated OpenApi SDK, but copied here since currently we are mostly interested in referencing
 * -only- the models from the SDK.
 */

export const isDefined = <T>(
  value: T | null | undefined
): value is Exclude<T, null | undefined> => {
  return value !== undefined && value !== null;
};

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isStringWithValue = (value: any): value is string => {
  return isString(value) && value !== '';
};

export const isBlob = (value: any): value is Blob => {
  return (
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.stream === 'function' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.constructor === 'function' &&
    typeof value.constructor.name === 'string' &&
    /^(Blob|File)$/.test(value.constructor.name) &&
    /^(Blob|File)$/.test(value[Symbol.toStringTag])
  );
};

export const getFormData = (data: Record<string, any> | null): FormData | null => {
  if (!data) return null;
  const formData = new FormData();

  const process = (key: string, value: any) => {
    if (isString(value) || isBlob(value)) {
      formData.append(key, value);
    } else {
      formData.append(key, JSON.stringify(value));
    }
  };

  Object.entries(data)
    .filter(([, value]) => isDefined(value))
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => process(key, v));
      } else {
        process(key, value);
      }
    });

  return formData;
};

export const getQueryString = (params: Record<string, any>): string => {
  const qs: string[] = [];

  const append = (key: string, value: any) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  const process = (key: string, value: any) => {
    if (isDefined(value)) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          process(key, v);
        });
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          process(`${key}[${k}]`, v);
        });
      } else {
        append(key, value);
      }
    }
  };

  Object.entries(params).forEach(([key, value]) => {
    process(key, value);
  });

  if (qs.length > 0) {
    return `?${qs.join('&')}`;
  }

  return '';
};
