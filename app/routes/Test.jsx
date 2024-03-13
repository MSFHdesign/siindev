import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export let loader = async () => {
  // loader logik her
  return json({ data: "Eksempel på indlæst data" });
};

export function meta() {
  return [{ title: "Work Journal" }];
}

export default function Test() {
  let { data } = useLoaderData();
  return (
    <div>
      <h1>Hello from test!</h1>
      {data && <p>{data}</p>}
    </div>
  );
}
