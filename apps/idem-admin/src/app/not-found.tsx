import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Link } from '@eventuras/ratio-ui-next/Link';

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <Heading as="h1">404 - Page Not Found</Heading>
      <Text className="mt-4">The page you are looking for does not exist.</Text>
      <Link href="/admin" variant="button-primary" className="mt-8">
        Go to Dashboard
      </Link>
    </Container>
  );
}
