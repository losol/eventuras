import { Heading } from "@chakra-ui/react";
import { Layout } from "../../components/common";
import { useRouter } from "next/router";
import useSWR from "swr";

const EventInfo = (props) => {
  const { name = "Missing title", description = "Missing description" } = props;

  const router = useRouter();

  return (
    <Layout>
      <Heading>{name}</Heading>
      {description}
    </Layout>
  );
};

export async function getStaticProps({ params }) {
  console.log("**********" + params.id);
  const { id = "" } = params.id;
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/v2/events/" + id
  );
  const json = await res.json();
  return json;
}

export async function getStaticPaths() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v2/events/");
  const events = await res.json();
  // Get the paths we want to pre-render based on posts
  const paths = events.map((e) => ({
    params: { id: e.id.toString() },
  }));

  return { paths, fallback: true };
}
export default EventInfo;
