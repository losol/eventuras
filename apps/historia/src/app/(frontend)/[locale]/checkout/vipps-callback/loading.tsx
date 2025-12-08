import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Text } from '@eventuras/ratio-ui/core/Text';
import { Container } from '@eventuras/ratio-ui/layout/Container';

export default function VippsCallbackLoading() {
  return (
    <Container padding="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Loading />
            </div>
            <Heading as="h1" className="mb-2 text-2xl font-bold">
              Behandler betaling
            </Heading>
            <Text className="text-gray-600 dark:text-gray-400">
              Vennligst vent mens vi bekrefter din betaling...
            </Text>
          </div>
        </Card>
      </div>
    </Container>
  );
}
