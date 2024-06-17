#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { Command } from "commander";

import { JiraClient } from "../jira";
import * as utils from "../utils";

const program = new Command();

/**
 * Main entry point for the CLI tool.
 */
program
  .name("jira-version-me")
  .description("Jira Release Management")
  .requiredOption("-p, --project <project>", "The Jira project key")
  .requiredOption("-t, --token <token>", "The Jira API token")
  .requiredOption("-u, --url <url>", "The Jira URL");

/**
 * Validate command
 */
program
  .command("update")
  .option("-c, --component <component>", "The component to update")
  .requiredOption("-v, --version <version>", "The version to create")
  .option("-d, --description <description>", "The description of the version")
  .option("-r, --release", "Mark the version as released")
  .action(async options => {
    console.log("📔 JiraVersionMe - Update Jira Release");
    console.log("--------------------------------------");
    options = { ...program.opts(), ...options };
    const jira = new JiraClient(options.url, options.token);
    const componentVersion = utils.setComponentVersion(options.version, options.component);

    try {
      await jira.createOrUpdateVersion(options.project, {
        name: componentVersion,
        description: options.description,
        archived: false,
        released: options.release ?? false,
        releaseDate: options.release ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      program.error(`❌ ${(error as Error).message}`);
      return;
    }

    console.log(`✅ Version ${componentVersion} is up-to-date!`);
  });

program
  .command("assign")
  .option("-c, --component <component>", "The component to update")
  .requiredOption("-v, --version <version>", "The version to assign tickets to")
  .requiredOption("-t, --ticket <ticket...>", "List of JIRA tickets to assign to the specified version")
  .action(async options => {
    console.log("📔 JiraVersionMe - Assign Jira Tickets to Release");
    console.log("-------------------------------------------------");
    options = { ...program.opts(), ...options };
    const jira = new JiraClient(options.url, options.token);
    const componentVersion = utils.setComponentVersion(options.version, options.component);

    for (const issue of options.ticket) {
      try {
        await jira.assignTicketToVersion(issue, componentVersion);
      } catch (error) {
        program.error(`❌ ${(error as Error).message}`);
        return;
      }

      console.log(`✅ Issue ${issue} assigned to version ${componentVersion} successfully!`);
    }
  });

program.command("sort").action(async options => {
  console.log("📔 JiraVersionMe - Sort Jira Versions");
  console.log("------------------------------------");
  options = { ...program.opts(), ...options };
  const jira = new JiraClient(options.url, options.token);
  try {
    await jira.sortVersions(options.project);
  } catch (error) {
    program.error(`❌ ${(error as Error).message}`);
    return;
  }

  console.log(`✅ Versions sorted successfully!`);
});

program.parse(process.argv);
