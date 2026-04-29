terraform {
  required_version = ">= 1.5"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

provider "hcloud" {
  token = var.hcloud_token
}

resource "hcloud_ssh_key" "deploy" {
  name       = "smart-obd-deploy"
  public_key = var.ssh_public_key
}

resource "hcloud_firewall" "web" {
  name = "smart-obd-firewall"

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

resource "hcloud_volume" "data" {
  name     = "smart-obd-data"
  size     = 10
  location = var.location
  format   = "ext4"
}

resource "hcloud_server" "app" {
  name        = "smart-obd"
  server_type = var.server_type
  location    = var.location
  image       = "ubuntu-22.04"

  ssh_keys    = [hcloud_ssh_key.deploy.id]
  firewall_ids = [hcloud_firewall.web.id]

  user_data = templatefile("${path.module}/cloud-init.yml", {
    domain = var.domain
  })

  labels = {
    project = "smart-obd"
    env     = "production"
  }
}

resource "hcloud_volume_attachment" "data" {
  volume_id = hcloud_volume.data.id
  server_id = hcloud_server.app.id
  automount = true
}
