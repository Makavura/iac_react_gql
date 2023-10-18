terraform {
  required_providers {
    docker = {
      source  = "bierwirth-it/docker"
      version = "3.0.4"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.21.0"
    }
  }
}


provider "aws" {
  region = "ca-central-1"
}


locals {
  container_port = 80
  image_name     = "reader"
  container_name = "reader"
}

resource "aws_ecr_lifecycle_policy" "default_policy" {
  repository = "reader"


  policy = <<EOF
	{
	    "rules": [
	        {
	            "rulePriority": 1,
	            "description": "Keep only the last ${var.untagged_images} untagged images.",
	            "selection": {
	                "tagStatus": "untagged",
	                "countType": "imageCountMoreThan",
	                "countNumber": ${var.untagged_images}
	            },
	            "action": {
	                "type": "expire"
	            }
	        }
	    ]
	}
	EOF
}



# Setup VPC (networks)
data "aws_availability_zones" "available" { state = "available" }
module "vpc" {
  source             = "terraform-aws-modules/vpc/aws"
  name               = "reader"
  azs                = ["ca-central-1a", "ca-central-1b"]
  cidr               = "10.0.0.0/16"
  create_vpc         = true
  create_igw         = true # Expose public subnetworks to the Internet
  enable_nat_gateway = true # Hide private subnetworks behind NAT Gateway
  private_subnets    = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets     = ["10.0.101.0/24", "10.0.102.0/24"]
  single_nat_gateway = true

  tags = {
    Terraform   = "true"
    Environment = "dev"
  }
}

# Make application accessible to internet with an AWS Load Balancer
# Accept HTTP requests from the internet
# Forward HTTP requests from the internet to our containePort where our container will eventually be running
# Allow our container and other resources to make HTTP requests to external services

# ./main.tf

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.4.0"

  load_balancer_type = "application"
  security_groups    = [module.vpc.default_security_group_id]
  subnets            = module.vpc.public_subnets
  vpc_id             = module.vpc.vpc_id

  security_group_rules = {
    ingress_all_http = {
      type        = "ingress"
      from_port   = 80
      to_port     = 80
      protocol    = "TCP"
      description = "Permit incoming HTTP requests from the internet"
      cidr_blocks = ["0.0.0.0/0"]
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "Permit all outgoing requests to the internet"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  http_tcp_listeners = [
    {
      # * Setup a listener on port 80 and forward all HTTP
      # * traffic to target_groups[0] defined below which
      # * will eventually point to our "Hello World" app.
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]


  target_groups = [

    {
      backend_port     = 80
      backend_protocol = "HTTP"
      target_type      = "ip"
    }
  ]
}

# Create Fargate Cluster
# ./main.tf

module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 4.1.3"

  cluster_name = "reader"

  # * Allocate 20% capacity to FARGATE and then split
  # * the remaining 80% capacity 50/50 between FARGATE
  # * and FARGATE_SPOT.
  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        base   = 20
        weight = 50
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

# Define ECS Task
# Command  AWS how to run our container
resource "aws_ecs_task_definition" "reader" {
  container_definitions = jsonencode([{
    environment : [],
    essential    = true,
    image        = "" // image url in ECR
    name         = "reader",
    portMappings = [{ containerPort = 80 }],
  }])
  cpu    = 1024
  family = "reader"
  memory = 2048

  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  task_role_arn            = "" // arn referenced from Role set in IAM
  execution_role_arn       = "" // arn referenced from Role set in IAM

}

# Run app/container
resource "aws_ecs_service" "reader" {
  cluster         = module.ecs.cluster_id
  desired_count   = 2
  launch_type     = "FARGATE"
  name            = "reader"
  task_definition = resource.aws_ecs_task_definition.reader.arn

  lifecycle {
    ignore_changes = [desired_count] # Allow external changes to happen without Terraform conflicts, particularly around auto-scaling.
  }

  load_balancer {
    container_name   = local.container_name
    container_port   = local.container_port
    target_group_arn = module.alb.target_group_arns[0]
  }

  network_configuration {
    assign_public_ip = true
    security_groups  = [module.vpc.default_security_group_id]
    subnets          = module.vpc.private_subnets
  }
}

# URL to application
# * Output the URL of our Application Load Balancer so that we can connect to
# * our application running inside ECS once it is up and running.
output "url" { value = module.alb.lb_dns_name }
