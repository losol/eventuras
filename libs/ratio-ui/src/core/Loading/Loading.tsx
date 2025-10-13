import { LoaderCircle } from '../icons';

// Source: https://flowbite.com/docs/@/components/spinner/
const Loading = () => {
  return (
    <div role="status">
      <LoaderCircle className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
