/*
 * SPDX-FileCopyrightText: 2023 Kevin de Jong <monkaii@hotmail.com>
 * SPDX-License-Identifier: MIT
 */

import * as core from "@actions/core";

import { JiraClient } from "../jira";

/**
 * Main entry point for the GitHub Action.
 */
async function run(): Promise<void> {
  try {
    core.info("📔 JiraVersionMe - Jira Release Management");

    const project = core.getInput("project");
    const jiraToken = core.getInput("jira-token");
    const jiraUrl = core.getInput("jira-url");

    const version = core.getInput("version");
    const description = core.getInput("description");
    const release = core.getBooleanInput("release") || false;

    const jira = new JiraClient(jiraUrl, jiraToken);

    core.startGroup("🔑 Jira Configuration");
    core.info(`URL: ${jiraUrl}`);
    core.info(`Project: ${project}`);
    core.info(`Token: ***`);
    core.info(`Api Version: ${jira.apiVersion}`);
    core.endGroup();

    core.startGroup("📄 Version Configuration");
    core.info(`Version: ${version}`);
    core.info(`Description: ${description}`);
    core.info(`Release: ${release}`);
    core.info(`Archive: false`);
    core.endGroup();

    await jira.createOrUpdateVersion(project, {
      name: version,
      description,
      archived: false,
      released: release,
      releaseDate: release ? new Date().toISOString() : undefined,
    });

    core.info(`✅ Version ${version} is up-to-date!`);

    const tickets = core.getMultilineInput("ticket");
    let errorCount = 0;
    for (const ticket of tickets) {
      try {
        await jira.assignTicketToVersion(ticket, version);
      } catch (error) {
        core.error(`❌ ${(error as Error).message}`);
        errorCount++;
        return;
      }

      core.info(`✅ Issue ${ticket} assigned to version ${version} successfully!`);
    }

    if (errorCount > 0) {
      core.setFailed(`❌ ${errorCount} errors occurred while assigning tickets to version ${version}`);
    }
  } catch (ex) {
    core.setFailed((ex as Error).message);
  }
}

run();
