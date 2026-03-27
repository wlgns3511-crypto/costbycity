import { Metadata } from "next";
import { RelocationCalculator } from "@/components/RelocationCalculator";

export const metadata: Metadata = {
  title: "Relocation Calculator - Embeddable Widget",
  robots: "noindex, nofollow",
};

export default function EmbedRelocationPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <RelocationCalculator cityName="" defaultCostIndex={100} />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://costbycity.com" target="_blank" rel="noopener" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          CostByCity
        </a>
      </p>
    </div>
  );
}
