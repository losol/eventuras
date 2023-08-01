import { Text } from '@chakra-ui/react';

type EventMetaType = string | boolean | null;

type MetaItemProps = {
  text: string;
  value: EventMetaType;
};

const MetaItem = (props: MetaItemProps) => {
  const { text, value } = props;

  // Nothing if API data is null
  if (value === null) {
    return null;
  }

  return (
    <Text>
      {text}: {/* TODO: Remove toString after will understand what UI to create for booleans */}
      {value.toString()}
    </Text>
  );
};

export default MetaItem;
