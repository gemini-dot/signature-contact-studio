import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { Body, Html, Text } from "@react-email/components";

describe("email rendering dependency compatibility", () => {
  it("renders encoded characters to plain text through the HTML parser", async () => {
    const text = await render(
      <Html><Body><Text>{"Équipe & associés <contact>"}</Text></Body></Html>,
      { plainText: true },
    );
    expect(text).toContain("Équipe & associés <contact>");
  });
});