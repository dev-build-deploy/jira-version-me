/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { SemVer } from "@dev-build-deploy/version-it";

import { Version } from "./jira";

/**
 * Check if the component is valid, incl.
 * - No spaces
 * - All lower case
 *
 * @param component - The component to check
 * @returns - True if the component is valid, false otherwise
 */
export function isValidComponent(component?: string): boolean {
  if (!component) {
    return true;
  }

  return !component.includes(" ") && component === component.toLowerCase();
}

/**
 * Check if the version is valid SemVer.
 * @param version - The version to check
 * @returns - True if the version is valid, false otherwise
 */
export function isSemver(version: string): boolean {
  try {
    new SemVer(version);
  } catch (error) {
    return false;
  }

  return true;
}

/**
 * Extracts the component name and version from the provided version name.
 * @param version - The version name
 * @returns - The component name and version
 */
export function getComponentVersion(version: string): { component?: string; version: string } {
  const index = version.lastIndexOf("/");
  if (index === -1) {
    return { component: undefined, version };
  }

  const component = version.substring(0, index);
  const versionStr = version.substring(index + 1);

  if (!isValidComponent(component)) {
    throw new Error(`Invalid component: ${component}`);
  }

  if (!isSemver(versionStr)) {
    throw new Error(`Invalid Semantic Version: ${versionStr}`);
  }

  return { component, version: versionStr };
}

/**
 * Creates a component version name from the provided component and version.
 * @param component - The component name
 * @param version - The version
 * @returns - The component version name
 * @throws - If the component or version is invalid
 */
export function setComponentVersion(version: string, component?: string): string {
  if (!isValidComponent(component)) {
    throw new Error(`Invalid component: ${component}`);
  }

  if (!isSemver(version)) {
    throw new Error(`Invalid Semantic Version: ${version}`);
  }

  if (!component) {
    return version;
  }

  return `${component}/${version}`;
}

/**
 * Sorts the provided versions by component and version.
 * @param versions - The versions to sort
 * @returns - The sorted versions
 */
export function sortFixVersions(versions: Version[]): Version[] {
  return [...versions]
    .filter(v => {
      return isSemver(getComponentVersion(v.name).version);
    })
    .sort((a, b) => {
      return new SemVer(getComponentVersion(a.name).version).compareTo(new SemVer(getComponentVersion(b.name).version));
    })
    .sort((a, b) => {
      return (getComponentVersion(b.name).component ?? "").localeCompare(getComponentVersion(a.name).component ?? "");
    });
}
