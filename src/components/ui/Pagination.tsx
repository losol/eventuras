import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';

import Button from './Button';
import Text from './Text';

export type PaginationProps = {
  onPreviousPageClick: () => void;
  onNextPageClick: () => void;
  currentPage: number;
  totalPages: number;
};

const Pagination: React.FC<PaginationProps> = ({
  onPreviousPageClick,
  onNextPageClick,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="flex justify-center">
      <Text className="flex py-2 px-5">
        <Button
          aria-label="Previous Page"
          onClick={onPreviousPageClick}
          disabled={currentPage <= 1}
          leftIcon={<IconChevronsLeft />}
          className="flex-col"
        />
        <Text className="flex-col">
          Page <Text as="span">{currentPage}</Text> of <Text as="span">{totalPages}</Text>
        </Text>
        <Button
          aria-label="Next Page"
          onClick={onNextPageClick}
          disabled={currentPage >= totalPages}
          leftIcon={<IconChevronsRight />}
          className="flex-col"
        />
      </Text>
    </div>
  );
};

export default Pagination;
