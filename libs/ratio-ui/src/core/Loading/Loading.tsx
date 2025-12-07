import { Spinner } from "../Spinner/Spinner";

export const Loading = () => {
  return (
    <div role="status">
      <Spinner />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
