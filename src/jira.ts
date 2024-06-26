/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from "@actions/core";
import { SemVer } from "@dev-build-deploy/version-it";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import * as utils from "./utils";

/**
 * Jira Version.
 * @internal
 */
export type Version = {
  self: string;
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  released: boolean;
  startDate?: string;
  releaseDate?: string;
  overdue?: boolean;
  userStartDate?: string;
  userReleaseDate?: string;
  projectId: number;
};

/**
 * Jira Project.
 * @internal
 */
type Project = {
  self: string;
  id: number;
  key: string;
  name: string;
  versions: Version[];
  uuid: string;
};

/**
 * Omit properties from a type.
 * @internal
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Represents a Jira client for making API requests.
 */
export class JiraClient {
  axios: AxiosInstance;
  baseUrl: string;
  baseOptions?: AxiosRequestConfig;

  apiVersion: 1 | 2 | 3;

  /**
   * Constructs a new instance of the JiraClient class.
   * @param baseUrl - The base URL of the Jira server.
   * @param bearerToken - The bearer token for authentication.
   */
  constructor(baseUrl: string, bearerToken: string) {
    this.baseUrl = baseUrl;
    this.axios = axios.create();

    this.apiVersion = 2; // TODO: Make this configurable
    this.baseOptions = {
      // TODO: Support multiple authentication methods
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "X-Atlassian-Token": "no-check",
      },
    };
  }

  /**
   * Makes a request to the Jira API.
   * @param method - The HTTP method of the request.
   * @param path - The path of the API endpoint.
   * @param data - Optional data to send with the request.
   * @returns - A promise that resolves to the Axios response.
   */
  private async request(
    method: "GET" | "POST" | "PUT",
    path: string,
    data?: Record<string, any>
  ): Promise<AxiosResponse> {
    let request: AxiosRequestConfig<any>;
    switch (method) {
      case "GET":
        request = this.buildRequest(method, this.buildUri(path, data));
        break;
      default:
        request = this.buildRequest(method, this.buildUri(path), data);
        break;
    }
    return this.axios.request(request);
  }

  /**
   * Builds a URL for the API request.
   * @param path - The path of the API endpoint.
   * @param query - Optional query parameters.
   * @returns - The built URL.
   */
  private buildUri(path: string, query?: Record<string, string | number | boolean>): URL {
    const uri = new URL(`${this.baseUrl}/rest/api/${this.apiVersion}/${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => uri.searchParams.append(key, String(value)));
    }
    return uri;
  }

  /**
   * Builds the request configuration for the Axios request.
   * @param method - The HTTP method of the request.
   * @param uri - The URL of the API endpoint.
   * @returns - The Axios request configuration.
   */
  private buildRequest(method: "GET" | "POST" | "PUT", uri: URL, options?: any): AxiosRequestConfig {
    return { method, url: uri.toString(), ...this.baseOptions, data: options };
  }

  /**
   * Retrieves information about a project.
   * @param project - The key or ID of the project.
   * @returns - A promise that resolves to the project information.
   */
  async getProject(project: string): Promise<Project> {
    const projectData = (
      await this.request("GET", `project/${project}`).catch(err => {
        throw new Error(err.response.data.errorMessages.join(", "));
      })
    ).data;

    if (typeof projectData === "string") {
      throw new Error(`Unable to retrieve the Jira project ${project}.`);
    }

    return projectData;
  }

  /**
   * Creates or updates a version in a project.
   * @param project - The key or ID of the project.
   * @param version - The version object to create or update.
   * @returns - A promise that resolves when the version is created or updated.
   */
  async createOrUpdateVersion(
    project: string,
    version: Omit<Version, "self" | "id" | "project" | "projectId" | "userStartDate" | "userReleaseDate">
  ): Promise<void> {
    const projectData = await this.getProject(project);

    for (const v of projectData.versions || []) {
      if (version.name === v.name) {
        core.info(`ℹ️  Version ${version.name} already exists in project ${project}, updating....`);
        await this.request("PUT", `version/${v.id}`, version).catch(err => {
          throw new Error(err.response.data.errorMessages.join(", "));
        });

        return;
      }
    }

    core.info(`ℹ️  Creating version ${version.name} in project ${project}...`);
    const newVersion: Version = (
      await this.request("POST", "version", {
        ...version,
        project: project,
        projectId: projectData.id,
      }).catch(err => {
        throw new Error(err.response.data.errorMessages.join(", "));
      })
    ).data;

    const sortedVersions = utils
      .sortFixVersions(projectData.versions)
      .filter(
        v => utils.getComponentVersion(v.name).component === utils.getComponentVersion(newVersion.name).component
      );

    for (let idx = 0; idx < sortedVersions.length; idx++) {
      const cur = utils.getComponentVersion(newVersion.name);
      const sor = utils.getComponentVersion(sortedVersions[idx].name);

      if (new SemVer(sor.version).isGreaterThan(new SemVer(cur.version))) {
        await this.moveVersion(newVersion, idx > 0 ? sortedVersions[idx - 1] : "First");
        return;
      } else if (idx === sortedVersions.length - 1) {
        await this.moveVersion(newVersion, sortedVersions[idx]);
        return;
      }
    }
  }

  /**
   * Updates the version of an issue.
   * @param issue Jira issue Key
   * @param version The version to assign to the issue
   */
  async assignTicketToVersion(issue: string, version: string): Promise<void> {
    core.info(`ℹ️  Updating issue ${issue} with version ${version}...`);
    await this.request("PUT", `issue/${issue}`, { fields: { fixVersions: [{ name: version }] } }).catch(err => {
      if ("fixVersions" in err.response.data.errors) {
        throw new Error(err.response.data.errors.fixVersions);
      } else {
        throw new Error(err.response.data.errorMessages.join(", "));
      }
    });
  }

  /**
   * Moves a version to a new position.
   * @param version - The version to move.
   * @param after - The version to move after.
   */
  async moveVersion(version: Version, after: "First" | Version): Promise<void> {
    if (after === "First") {
      console.log(`ℹ️  Version ${version.name} is moved to the first position.`);
      await this.request("POST", `version/${version.id}/move`, { position: "First" });
      return;
    }

    core.info(`ℹ️  Moving version ${version.name} after version ${after.name}...`);
    await this.request("POST", `version/${version.id}/move`, { after: after.self });
  }

  /**
   * Sorts the versions of a project.
   * @param project The key or ID of the project.
   * @returns A promise that resolves when the versions are sorted.
   */
  async sortVersions(project: string): Promise<void> {
    const projectData = await this.getProject(project);

    core.startGroup(`📦 Sorting versions in project ${project}...`);
    if (projectData.versions.length === 0) {
      core.info(`ℹ️  No versions found in project ${project}.`);
      return;
    }

    const sortedVersions = utils.sortFixVersions(projectData.versions);

    await this.moveVersion(sortedVersions[0], "First");
    for (let idx = 1; idx < sortedVersions.length; idx++) {
      await this.moveVersion(sortedVersions[idx], sortedVersions[idx - 1]);
    }
    core.endGroup();
  }
}
