import type { Access } from 'payload';

/**
 * Access control for guest cart access via secret query parameter.
 * Allows read/update operations if a valid cart secret is provided.
 *
 * Inspired by Payload's official e-commerce plugin:
 * @see https://github.com/payloadcms/payload/blob/main/packages/plugin-ecommerce/src/collections/carts/hasCartSecretAccess.ts
 *
 * @returns Access function that checks for valid cart secret in query params
 */
export const hasCartSecretAccess: Access = ({ req }) => {
  const cartSecret = req.query?.secret;

  if (!cartSecret || typeof cartSecret !== 'string') {
    return false;
  }

  return {
    secret: {
      equals: cartSecret,
    },
  };
};
