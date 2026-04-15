import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import "./builders/domSetup.ts";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../src/app/router";

describe("router", () => {
  beforeEach(() => {
    globalThis.document.body.innerHTML = "";
    globalThis.window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    globalThis.document.body.innerHTML = "";
  });

  it("renders the home route by default and navigates to about", async () => {
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    const homeHeading = screen.getByRole("heading", { name: "Home" });
    assert.equal(homeHeading.tagName, "H1");

    await user.click(screen.getByRole("link", { name: "About" }));

    const aboutHeading = await screen.findByRole("heading", { name: "About" });
    assert.equal(aboutHeading.tagName, "H1");
  });
});
