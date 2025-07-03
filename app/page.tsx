import type { Metadata } from "next"
import App from "../App"

export const metadata: Metadata = {
  title: "TandT - Decision Making & Performance Review Tool",
  description:
    "A comprehensive tool for decision making analysis and performance reviews using digital thinking models.",
}

export default function Page() {
  return <App />
}
