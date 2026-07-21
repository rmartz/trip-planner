import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LANDING_PAGE_COPY } from "./LandingPageView.copy";
import { LandingPageView } from "./LandingPageView";

afterEach(cleanup);

describe("LandingPageView", () => {
  it("renders the headline and subhead", () => {
    render(<LandingPageView />);

    expect(screen.getByText(LANDING_PAGE_COPY.headline)).toBeDefined();
    expect(screen.getByText(LANDING_PAGE_COPY.subhead)).toBeDefined();
  });

  it("points the primary call to action at sign-up", () => {
    render(<LandingPageView />);

    const createAccount = screen.getByText(LANDING_PAGE_COPY.primaryCta);
    expect(createAccount.getAttribute("href")).toBe("/sign-up");
  });

  it("points the sign-in call to action at sign-in", () => {
    render(<LandingPageView />);

    const signIn = screen.getByText(LANDING_PAGE_COPY.signInCta);
    expect(signIn.getAttribute("href")).toBe("/sign-in");
  });
});
