import { READING } from "@/data/reading";
import View from "./View";

export function generateStaticParams() {
  return READING.map((x) => ({ id: x.id }));
}

export default function Page() {
  return <View />;
}
