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
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/events/" + params.id
  );
  const json = await res.json();
  return { props: { ...json } };
}

export async function getStaticPaths() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/v1/events/");
  const events = await res.json();

  const paths = events.map((e) => ({
    params: {
      id: e.id.toString(),
    },
  }));

  return { paths, fallback: false };
}
export default EventInfo;
