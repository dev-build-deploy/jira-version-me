/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { Version } from "../src/jira";
import * as utils from "../src/utils";

describe("isValidComponent", () => {
  test("Valid Component", () => {
    expect(utils.isValidComponent("component")).toBe(true);
  });

  test("Invalid Component", () => {
    expect(utils.isValidComponent("Component")).toBe(false);
  });

  test("No Component", () => {
    expect(utils.isValidComponent()).toBe(true);
  });
});

describe("isSemver", () => {
  test("Valid SemVer", () => {
    expect(utils.isSemver("1.0.0")).toBe(true);
  });

  test("Invalid SemVer", () => {
    expect(utils.isSemver("1.0")).toBe(false);
  });
});

describe("getComponentVersion", () => {
  test("Component Version", () => {
    expect(utils.getComponentVersion("component/1.0.0")).toEqual({
      component: "component",
      version: "1.0.0",
    });
  });

  test("No Component", () => {
    expect(utils.getComponentVersion("1.0.0")).toEqual({
      component: undefined,
      version: "1.0.0",
    });
  });

  test("Invalid Component", () => {
    expect(() => {
      utils.getComponentVersion("WRONG COMPONENT/1.0");
    }).toThrowError("Invalid component: WRONG COMPONENT");
  });

  test("Invalid Semantic Version", () => {
    expect(() => {
      utils.getComponentVersion("component/1.0");
    }).toThrowError("Invalid Semantic Version: 1.0");
  });
});

describe("setComponentVersion", () => {
  test("Set Component Version", () => {
    expect(utils.setComponentVersion("1.0.0", "component")).toBe("component/1.0.0");
  });

  test("No Component", () => {
    expect(utils.setComponentVersion("1.0.0")).toBe("1.0.0");
  });
});

describe("sortFixVersions", () => {
  test("Sort Versions", () => {
    const versions: Version[] = [
      {
        id: "1",
        name: "component/1.0.0",
        self: "abc",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "2",
        name: "component/1.1.0",
        self: "def",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "3",
        name: "component/1.0.1",
        self: "ghi",
        archived: false,
        released: false,
        projectId: 0,
      },
    ];

    const sortedVersions: Version[] = [
      {
        id: "1",
        name: "component/1.0.0",
        self: "abc",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "3",
        name: "component/1.0.1",
        self: "ghi",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "2",
        name: "component/1.1.0",
        self: "def",
        archived: false,
        released: false,
        projectId: 0,
      },
    ];
    expect(utils.sortFixVersions(versions)).toStrictEqual(sortedVersions);
  });

  test("Sort Versions per Component", () => {
    const versions: Version[] = [
      {
        id: "1",
        name: "1.0.0",
        self: "abc",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "2",
        name: "app/1.1.0",
        self: "def",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "3",
        name: "app/1.0.1",
        self: "ghi",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "4",
        name: "framework/3.0.0",
        self: "jkl",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "5",
        name: "3.0.0",
        self: "mno",
        archived: false,
        released: false,
        projectId: 0,
      },
    ];

    const sortedVersions: Version[] = [
      {
        id: "4",
        name: "framework/3.0.0",
        self: "jkl",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "3",
        name: "app/1.0.1",
        self: "ghi",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "2",
        name: "app/1.1.0",
        self: "def",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "1",
        name: "1.0.0",
        self: "abc",
        archived: false,
        released: false,
        projectId: 0,
      },
      {
        id: "5",
        name: "3.0.0",
        self: "mno",
        archived: false,
        released: false,
        projectId: 0,
      },
    ];
    expect(utils.sortFixVersions(versions)).toStrictEqual(sortedVersions);
  });
});
