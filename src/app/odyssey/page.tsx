import type { Metadata } from "next";
import { Odyssey } from "@/components/odyssey/Odyssey";

export const metadata: Metadata = {
  title: "Quantum Odyssey · El Archivo de Hilbert",
  description: "Explora, experimenta y reconstruye el Archivo de Hilbert. Una expedición científica interactiva de Quantum Command.",
};

export default function OdysseyPage() {
  return <Odyssey />;
}
