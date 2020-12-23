import { Skeleton, Stack } from "@chakra-ui/react";

const Loading = () => {
  return (
    <Stack>
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
    </Stack>
  );
};

export default Loading;
