import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Link } from '@eventuras/ratio-ui-next/Link';

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <Heading as="h1">404 - Page Not Found</Heading>
      <Text marginTop="sm">The page you are looking for does not exist.</Text>
      <Link href="/admin" variant="button-primary" marginTop="lg">
        Go to Dashboard
      </Link>
    </Container>
  );
}
