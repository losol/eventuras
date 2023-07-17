import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';

export default function Unauthorized() {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      paddingY={32}
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Ingen tilgang
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        Logg inn for å se denne siden.
      </AlertDescription>
    </Alert>
  );
}
