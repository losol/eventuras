import { Badge, Button, Card as MantineCard, Group, Image, Text } from '@mantine/core';
import Link from 'next/link';

interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  href?: string;
  tag?: string;
}

const Card = (props: CardProps): React.JSX.Element => {
  return (
    <MantineCard shadow="sm" padding="lg" radius="md" withBorder>
      {props.imageUrl && (
        <MantineCard.Section>
          <Image src={props.imageUrl} height={160} alt="Norway" />
        </MantineCard.Section>
      )}

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{props.title}</Text>
        {props.tag && (
          <Badge color="pink" variant="light">
            props.tag
          </Badge>
        )}
      </Group>

      <Text size="sm">{props.description}</Text>

      {props.href && (
        <Link href={props.href} passHref>
          <Button component="a" variant="light" color="blue" fullWidth mt="md" radius="md">
            Read more
          </Button>
        </Link>
      )}
    </MantineCard>
  );
};

export default Card;
