#!/usr/bin/env node

/*
 * SPDX-FileCopyrightText: 2024 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import { Command } from "commander";

import { JiraClient } from "../jira";

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
  .requiredOption("-v, --version <version>", "The version to create")
  .option("-d, --description <description>", "The description of the version")
  .option("-r, --release", "Mark the version as released")
  .action(async options => {
    console.log("📔 JiraVersionMe - Update Jira Release");
    console.log("--------------------------------------");
    options = { ...program.opts(), ...options };
    const jira = new JiraClient(options.url, options.token);
    try {
      await jira.createOrUpdateVersion(options.project, {
        name: options.version,
        description: options.description,
        archived: false,
        released: options.release ?? false,
        releaseDate: options.release ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      program.error(`❌ ${(error as Error).message}`);
      return;
    }

    console.log(`✅ Version ${options.version} is up-to-date!`);
  });

program
  .command("assign")
  .requiredOption("-v, --version <version>", "The version to assign tickets to")
  .requiredOption("-t, --ticket <ticket...>", "List of JIRA tickets to assign to the specified version")
  .action(async options => {
    console.log("📔 JiraVersionMe - Assign Jira Tickets to Release");
    console.log("-------------------------------------------------");
    options = { ...program.opts(), ...options };
    const jira = new JiraClient(options.url, options.token);
    for (const issue of options.ticket) {
      try {
        await jira.assignTicketToVersion(issue, options.version);
      } catch (error) {
        program.error(`❌ ${(error as Error).message}`);
        return;
      }

      console.log(`✅ Issue ${issue} assigned to version ${options.version} successfully!`);
    }
  });

program.parse(process.argv);
