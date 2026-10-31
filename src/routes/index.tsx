import { createFileRoute } from "@tanstack/react-router";
import { Ogonyok } from "@/game/Ogonyok";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  return (
    <main className="h-dvh overflow-hidden">
      <Ogonyok />
    </main>
  );
}
