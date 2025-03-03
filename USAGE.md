## Table of Contents
- [ODX-API Platform - Application Build Template](#odx-api-platform---application-build-template)
  - [Environments](#environments)
    - [Production Environments](#production-environments)
    - [NonProduction Environments](#nonproduction-environments)
  - [Usage](#usage)
    - [Automatic jobs](#automatic-jobs)
    - [Manual jobs](#manual-jobs)
  - [Deployment Configuration](#deployment-configuration)
  - [Infrastructure Configuration](#infrastructure-configuration)
    - [Dynatrace SaaS links](#dynatrace-saas-links)

# ODX-API Platform - Application Build Template

This is the template to use when creating a new application for build and hosting on the ODX-API platform.

See <https://confluence.alm.cas.ns2s.corp.hmrc.gov.uk/display/ODR/ODX-API> for higher level documentation.

The structure of an application repository should be a service level group containing one or more application repositories e.g. self-assessment/registry.

## Environments

Each branch in the repository will correspond to an environment in AWS, although deploying supporting infrastructure is optional. Care should be taken to remove infrastructure for temporary branches before removing the branch via a merge request or other mechanism as once the branch is removed the associated infrastructure cannot be managed via the pipelines.

NOTE: Branch names and other configuration mappings are usually case sensitive.

### Production Environments

These environments are pre-configured on these branch names and will be deployed to the production AWS account. Use of the Preproduction and Staging environments are optional and they can be deleted if not required. If any additional production environments are required they must be requested via CMDG.

* Production
* Preproduction
* Staging

### NonProduction Environments

The Development branch is the default branch for the nonprod AWS account. Any other branches created will be deployed to the nonprod AWS account. Custom branch names should be kept short to prevent issues with the pipeline as some dependent resources have name length constraints. Branch names MUST not contain special characters except for hyphens.

* Development (default)
* Any other branch name, e.g. dev-1 or feature-newbutton

## Usage

Configure the `deployment-config.json` as required. The `Build_Command` will be used to build the application in the pipeline. This MUST NOT have any sub-commands which require human interaction as these are not possible in a pipeline job.

### Automatic jobs

When running the pipeline the `build-control-scripts` job parses the configuration and performs validation. The output of this job should be checked on first push to ensure there are no errors or warnings present. Any validation errors will fail the pipeline job and prevent deployment.

The `app-build` job builds the application using the specified build command. The `dockerfile` job creates the container build configuration, and the `container-build` job builds and pushes the container image to Artifactory.

The `plan-infrastructure` job is a dry run and will inform you of any changes to infrastructure which will be made following your code push.

### Manual jobs

The `apply-infrastructure` job will build/modify AWS infrastructure as shown in the dry run, and will then execute the `deploy-image` job to deploy the application code. In static-ec2 environment types the `deploy-image` job will show all log output from the build and deployment process, and for hpha environments it will monitor and provide feedback on the status of the blue/green deployment mechanism.

The `destroy-infrastructure` job is optional, and will remove any infrastructure from AWS for the current environment. This is important for housekeeping and to save costs when environments are not in use. Once an environment is destroyed it can be re-built by creating a new pipeline for that branch or by re-running the `apply-infrastructure` and `deploy-image` jobs (in sequence) on the same pipeline.

## Deployment Configuration

NOTE: Any additional routing or Pega side configuration is not part of this stack and will need to be managed separately.

Exploring the configuration file:

```shell
  # The service configuration is global and contains the application routing path and build command
  "Service": {
    # The Subpath is the host path following the URL for this service, excluding the environment
    "Subpath": "/services/service-name/path",
    # The Build_Command is the command which will be executed to perform the build in the pipeline
    "Build_Command": "npm run build:prod:ci"
  },
  # This is the header for the environment, and must match the branch name (case sensitive)
  "Development": {
    # The high level environment configuration
    "Environment": {
      # The static-ec2 type is a single host in AWS which will be re-used when a new build is created
      "Type": "static-ec2",
      # The internal routing type means the application will only be available from within the HMRC network
      "Routing" : "internal",
      # The Suffix defines the final component of the routing path in the URL and must start and end with /
      "Suffix": "/dev/"
    },
    # The infrastructure configuration
    "Infrastructure": {
      # The type of EC2 instance to deploy
      "EC2_Type": "c5a.large"
    },
    # The build specific configuration
    "Build": {
      # The path to the sdk-config file which will be deployed with this build
      "SDK_Path": "sdk-configs/Development.json",
      # The sdkContentServerUrl will be added to the sdk-config file post-deployment
      "sdkContentServerUrl": "https://internal.dxapi-nonprod.ns2n.corp.hmrc.gov.uk/services/service-name/path/dev/"
    }
  },
  # An example for Production, hpha-ec2 external routing
  "Production": {
    "Environment": {
      # Defines a highly available, blue/green strategy where hosts will be replaced when a new build is
      # deployed with zero downtime, and replaced weekly for security patching
      "Type": "hpha-ec2",
      # External routing type, means this will be accessible from the public Internet
      "Routing" : "external",
      "Suffix": "/"
    },
    "Infrastructure": {
      "EC2_Type": "c5a.large",
      # In hpha configuration the number of hosts will scale with load - here you can define the minimum
      # and maximum number of hosts which will be deployed and scaled to. For increased resilience specify
      # a minumum host count of more than 1
      "EC2_Minimum_Hosts" : "1",
      "EC2_Maximum_Hosts" : "4"
    },
    "Build": {
      "SDK_Path": "sdk-configs/Production.json",
      "sdkContentServerUrl": "https://external.dxapi-prod.ns2p.corp.hmrc.gov.uk/services/service-name/path/"
    }
  }
```

## Infrastructure Configuration

The EC2 instances built will use the ECS provided RHEL8.8 image and will have all mandatory software and security patches configured on boot, including Dynatrace SaaS monitoring in full-stack mode. The Production environment will be attached to Dynatrace Production, PreProduction and Staging will be attached to Dynatrace PreProduction, and any other environments will be attached to Dynatrace Nonproduction.

### Dynatrace SaaS links:

* NonProduction: <https://ihb49563.apps.dynatrace.com>
* PreProduction: <https://kdv79045.apps.dynatrace.com>
* Production: <https://tey47616.apps.dynatrace.com>