import { LESSONS } from "@/data/lessons";
import View from "./View";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export default function Page() {
  return <View />;
}
