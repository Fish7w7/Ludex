import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the Ludex shell", () => {
    render(<App />);

    expect(screen.getByText("Ludex")).toBeInTheDocument();
    expect(screen.getByText("ピコ~")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All Games" })).toBeInTheDocument();
    expect(screen.getByText("Scan Drives")).toBeInTheDocument();
  });
});
