import { LISTENING } from "@/data/listening";
import View from "./View";

export function generateStaticParams() {
  return LISTENING.map((x) => ({ id: x.id }));
}

export default function Page() {
  return <View />;
}
