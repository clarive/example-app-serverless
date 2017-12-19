<!--
title: Deploy AWS Simple HTTP Endpoint example in NodeJS with ClariveSE
description: This example demonstrates how to deploy a simple NodeJS function with ClariveSE
layout: Doc
-->
# ClariveSE serverless deployment

This is a very simple example of a Lambda function deployable by ClariveSE.

In this exaple you'll see some interesting techniques to use in your .clarive.yml files to manage your application deployments.

## Before using it

you have to add the next items to your ClariveSE instance:

- A Slack Incoming Webhook pointing to your Slack account defined webhook URL (check https://api.slack.com/incoming-webhooks)
- A couple of variables with your aws credentials (aws_key (text variable) and aws_secret (secret variable))

You can also remove slack functionality from the .clarive.yml and hardcode the values of the variables there but you'll miss
most of the nice stuff ;)

## .clarive directory files details

As you can see in the .clarive.yml file we're using a rulebook operation to parse the contents of a file:

```
  - aws_vars = parse:
      file: "{{ ctx.job('project') }}/{{ ctx.job('repository') }}/.clarive/vars.yml"
```

In this case we load the vars.yml file from the .clarive directory and the variables will be available in the `aws_vars` structure
for later use ( i.e. `{{ aws_vars.region }}`).

If you have a look at that directory, there is one vars.yml for each environment.  Clarive will use the correct one
depending on the target environment of the deployment job.

## .clarive.yml file

### Slack plugin operation in use

We use the slack_post operation available in our slack plugin [here](https://github.com/clarive/cla-slack-plugin).  We do some templating with the text
to generate a elaborated payload:

```
  - text =: |
      Version:
         {{ ctx.job('change_version') }}
      Branch:
         {{ ctx.job('branch') }}
      User:
         {{ ctx.job('user') }}
      Items modified:
         {{ ctx.job('items').map(function(item){ return '- (' + `${item.status}` + ') ' + `${item.item}`}).join('\n') }}
  - slack_post:
      webhook: SlackIncomingWebhook-1
      payload:
         attachments:
           - title: "Starting deployment {{ ctx.job('name') }} for project {{ ctx.job('project') }}"
             text: "{{ text }}"
             mrkdwn_in: ["text"]
```
You can play around with it to experiment with different formats and adding or removing contents to the payload at your wish

### Replacing variables in source code

We use the `sed` operation in the build step

```
  - sed [Replace variables]:
      path: "{{ ctx.job('project') }}/{{ ctx.job('repository') }}"
      excludes:
        - \.clarive
        - \.git
        - \.serverless
```

That will parse all the files in the path specified and will replace all `{{}}` and `${}` variables found.  You can find a couple of
examples in the `handler.js` file.

### Docker image to use

The image that we use is one of the available ones in https://hub.docker.com with the [Serverless framework](https://serverless.com/) installed

```
  - image:
      name: laardee/serverless
      environment:
         AWS_ACCESS_KEY_ID: "{{ ctx.var('aws_key') }}"
         AWS_SECRET_ACCESS_KEY: "{{ ctx.var('aws_secret') }}"
```

See that we set the environment variables needed for the serverless commands to point to the correct AWS account

### Operation decorators

Some of the operations you can find in the salmple .clarive.yml file are using decorators like this **[Test deployed application]**.  This will
be used in the job log inside ClariveSE instead of the name of the operation.  Of course you can use variables there :)

## How to test it

- First, use this repository cloned into a new or an existing project __(i.e project: serverless, repository: serverless)__
- Clone the new clarive repository from your git client:

```
git clone http[s]://<your_clarive_instance_URL>/git/serverless/serverless
```

- Create a new topic branch:
```
cd serverless
git branch -b feature/testing-serverless
```
- Commit and push some changes to the remote repository and go to Clarive monitor.  It should have created a new feature topic for you
and automatically launched the CI

Enjoy!!!