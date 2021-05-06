import { createStandaloneToast } from '@chakra-ui/react';
const toast = createStandaloneToast();

const success = (text: string): void => {
  toast({
    title: 'Account created.',
    description: text,
    status: 'success',
    duration: 9000,
    isClosable: true,
  });
};

const error = (text: string): void => {
  toast({
    title: 'We failed.',
    description: text,
    status: 'error',
    duration: 9000,
    isClosable: true,
  });
};

export const toaster = {
  success,
  error,
};
