import { cn } from "../utils";

describe("utils cn helper", () => {
  it("should concatenate class names and filter out falsy values", () => {
    expect(cn("btn", "btn-primary")).toContain("btn");
    expect(cn("btn", false, null, undefined, "active")).toContain("active");
  });
});
