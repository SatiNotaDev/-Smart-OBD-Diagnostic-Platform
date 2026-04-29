output "server_ip" {
  description = "Public IP of the server"
  value       = hcloud_server.app.ipv4_address
}

output "server_ipv6" {
  description = "IPv6 address of the server"
  value       = hcloud_server.app.ipv6_address
}

output "volume_path" {
  description = "Mount path of the data volume"
  value       = "/mnt/${hcloud_volume.data.name}"
}
