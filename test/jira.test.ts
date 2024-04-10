/* eslint-disable @typescript-eslint/unbound-method */
/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import axios from "axios";

import { JiraClient } from "../src/jira";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Get Project", () => {
  test("Basic Release", async () => {
    const jira = new JiraClient("https://jira.com", "token");
    jira.axios = axios as jest.Mocked<typeof axios>;

    mockedAxios.request.mockResolvedValueOnce({
      status: 200,
      statusText: "Ok",
      headers: {},
      config: {},
      data: [
        {
          self: "https://jira.com/rest/api/2/project/TEST",
          key: "TEST",
          name: "Test Project",
          versions: [],
          id: "10000",
        },
      ],
    });

    jira.getProject("TEST");

    expect(jira.axios.request).toHaveBeenNthCalledWith(1, {
      headers: {
        Authorization: "Bearer token",
        "X-Atlassian-Token": "no-check",
      },
      method: "GET",
      url: "https://jira.com/rest/api/2/project/TEST",
    });
  });
});
