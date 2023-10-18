Steps & Requirements

Requirements
- Docker CLI
- Terraform CLI
- AWS Account
- Node installed
- AWS ClI

Pre-Cloud Orchestration
- Create Iam Roles. _ARN to be referenced_
- Create Docker images from applications _Build images_ 
- Create ECR repositories to push to. 
- Initialize docker-credential-pass. _To enable saving aws credentials before push_
- Tag Docker iamges for pushing to repository. 
- Push images to repositories
- Set variables in variable.tf/main.tf directly
- Authenticate: 
    `export AWS SECRET_KEY = `
    `export AWS_ACCESS_KEY_ID = ` 

Orchestration.
Run.
- `terraform init`
- `terraform apply`


NOTE:

The Terraform configuration is incomplete.

While setting up, I ran into several issues:
 - Building Docker images, tagging them and pushing to ECR failed while using Terraform which necessitated the manual approach as shown above.
 - The ECS tasks to run the containers failed, but in the event that they were set up manually, they would reference the appropriate target.
 - Dyanmically fetching the url from the deployed server container and append to the frontend as part of the API definition `host:4000/graphql` seems a roundabout task, unless the load balancer was setup with a domain that would remain static or configure/preserver a static public facing IP for this purpose.

 The orchestration was not successful without manual interference.
 


UI Design:
For Initial design reference Ello Test Design.pdf under the docs subdirectory.
Please note that for the last view, the blurred background was removed for clarity purpose.

Local screenshots attached below:

UI:


