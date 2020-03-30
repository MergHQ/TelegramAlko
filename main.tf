provider "aws" {
  region = "eu-central-1"
}

data "aws_ssm_parameter" "bot_token" {
  name = "tg-alko-bot-token"
}

data "aws_ssm_parameter" "sentry_dsn" {
  name = "tg-alko-sentry-dsn"
}

data "aws_ssm_parameter" "alko_api_base_url" {
  name = "alko_api_base_url"
}

data "aws_ssm_parameter" "alko_api_key" {
  name = "alko_api_key"
}

data "aws_ecr_repository" "alko_bot_repo" {
 name = "tg-alko"
}

data "aws_ecs_cluster" "cluster" {
  cluster_name = "christina-regina"
}

data "aws_security_group" "alko_bot_sg" {
  name = "alko-bot-sg"
}

data "aws_subnet" "alko_bot_subnet" {
  id = "subnet-12bb6368"
}

data "aws_iam_role" "alko_bot_iam_role" {
  name = "ecsTaskExecutionRole"
}

resource "aws_cloudwatch_log_group" "alko_bot_cw" {
  name = "/ecs/christina-regina/alko-bot"
}

resource "aws_ecs_task_definition" "alko_bot_service" {
  family                   = "service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = "${data.aws_iam_role.alko_bot_iam_role.arn}"
  container_definitions    = <<DEFINITION
[
  {
    "name": "alko_bot_task",
    "image": "${data.aws_ecr_repository.alko_bot_repo.repository_url}:latest",
    "cpu": 256,
    "memory": null,
    "memoryReservation": null,
    "essential": true,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${aws_cloudwatch_log_group.alko_bot_cw.name}",
        "awslogs-region": "eu-central-1",
        "awslogs-stream-prefix": "ecs",
        "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S"
      }
    },
    "secrets": [
      {"name": "ALKO_BOT_TOKEN", "valueFrom": "${data.aws_ssm_parameter.bot_token.arn}"},
      {"name": "SENTRY_DSN", "valueFrom": "${data.aws_ssm_parameter.sentry_dsn.arn}"},
      {"name": "ALKO_API_BASE_URL", "valueFrom": "${data.aws_ssm_parameter.alko_api_base_url.arn}"},
      {"name": "ALKO_API_KEY", "valueFrom": "${data.aws_ssm_parameter.alko_api_key.arn}"}
    ]
  }
]
DEFINITION
}

resource "aws_ecs_service" "telegram_alko" {
  name            = "telegram-alko"
  cluster         = "${data.aws_ecs_cluster.cluster.id}"
  task_definition = "${aws_ecs_task_definition.alko_bot_service.arn}"
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [data.aws_security_group.alko_bot_sg.id]
    assign_public_ip = true
    subnets = [
      data.aws_subnet.alko_bot_subnet.id
    ]
  }
}
