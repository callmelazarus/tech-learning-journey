# AWS VPC (Virtual Private Cloud): Complete Overview

AWS VPC is a logically isolated virtual network within AWS where you launch and connect your cloud resources. It gives you complete control over your network environment, including IP address ranges, subnets, route tables, and network gateways. Think of a VPC as your own private data center in the cloud—you define the network topology, control traffic flow, and decide what can communicate with the outside world.

## Key Points

- **Purpose:** Isolated network environment for your AWS resources
- **Components:** Subnets, route tables, internet gateways, NAT gateways, security groups
- **IP Addressing:** You define CIDR blocks (e.g., 10.0.0.0/16)
- **Subnets:** Public subnets (internet-accessible) and private subnets (isolated)
- **Security:** Network ACLs and security groups control inbound/outbound traffic

## Step-by-Step Explanation & Examples

1. **Basic VPC Creation**

   ```
   VPC CIDR: 10.0.0.0/16
   └─ Provides 65,536 IP addresses (10.0.0.0 to 10.0.255.255)
   
   Resources:
   - VPC ID: vpc-abc123
   - Region: us-east-1
   - Default route table, network ACL, security group created automatically
   ```
   
   **Analogy:** Like buying a plot of land (10.0.0.0/16) where you'll build your infrastructure. The /16 determines how much space you have.

2. **Subnets (Public and Private)**

   ```
   VPC: 10.0.0.0/16
   
   Public Subnet (us-east-1a): 10.0.1.0/24
   └─ 256 IPs, has internet gateway route
   └─ Use for: Load balancers, bastion hosts, NAT gateways
   
   Private Subnet (us-east-1a): 10.0.2.0/24
   └─ 256 IPs, no direct internet access
   └─ Use for: Application servers, databases
   
   Public Subnet (us-east-1b): 10.0.3.0/24
   └─ High availability - second AZ
   
   Private Subnet (us-east-1b): 10.0.4.0/24
   └─ High availability - second AZ
   ```
   
   **Key difference:** Public subnets have a route to an Internet Gateway (0.0.0.0/0 → igw-xyz), private subnets don't.

3. **Internet Gateway (IGW) for Public Access**

   ```
   Internet Gateway: igw-123abc
   └─ Attached to VPC: vpc-abc123
   
   Route Table (Public):
   Destination       Target
   10.0.0.0/16      local         (VPC internal traffic)
   0.0.0.0/0        igw-123abc    (Internet traffic)
   
   Associated Subnets: 10.0.1.0/24, 10.0.3.0/24
   
   EC2 in public subnet (10.0.1.50) can now reach internet
   ```
   
   **Analogy:** Internet Gateway is like the front door of your house—allows traffic in and out to the public internet.

4. **NAT Gateway for Private Subnet Internet Access**

   ```
   NAT Gateway: nat-xyz789
   └─ Located in PUBLIC subnet: 10.0.1.0/24
   └─ Elastic IP: 52.123.45.67
   
   Route Table (Private):
   Destination       Target
   10.0.0.0/16      local
   0.0.0.0/0        nat-xyz789    (Outbound only through NAT)
   
   Associated Subnets: 10.0.2.0/24, 10.0.4.0/24
   
   Use case: Private EC2 instances can download updates from internet,
             but internet cannot initiate connections to them
   ```
   
   **Analogy:** NAT Gateway is like a security guard who lets your employees (private instances) go outside but doesn't let strangers come in.

5. **Security Groups (Stateful Firewall)**

   ```
   Security Group: sg-web-servers
   
   Inbound Rules:
   Type        Protocol  Port    Source
   HTTP        TCP       80      0.0.0.0/0
   HTTPS       TCP       443     0.0.0.0/0
   SSH         TCP       22      10.0.1.0/24 (only from public subnet)
   
   Outbound Rules:
   Type        Protocol  Port    Destination
   All traffic All       All     0.0.0.0/0
   
   Applied to: EC2 instances in private subnet
   
   Note: Stateful = if inbound allowed, outbound response automatic
   ```

6. **Complete Three-Tier Architecture**

   ```
   VPC: 10.0.0.0/16
   
   PUBLIC SUBNETS (Internet-facing)
   ├─ 10.0.1.0/24 (AZ-1): Application Load Balancer
   └─ 10.0.2.0/24 (AZ-2): Application Load Balancer
       ↓ (forwards traffic)
   
   PRIVATE SUBNETS (Application tier)
   ├─ 10.0.11.0/24 (AZ-1): Web/App servers (EC2, ECS)
   └─ 10.0.12.0/24 (AZ-2): Web/App servers (EC2, ECS)
       ↓ (database connections)
   
   PRIVATE SUBNETS (Database tier)
   ├─ 10.0.21.0/24 (AZ-1): RDS Primary
   └─ 10.0.22.0/24 (AZ-2): RDS Standby
   
   NAT Gateway in each public subnet for private subnet internet access
   ```

## Common Pitfalls

- Not planning CIDR blocks carefully (can't change VPC CIDR after creation easily)
- Forgetting to attach Internet Gateway to route table (no internet access)
- Placing NAT Gateway in private subnet instead of public
- Not spreading subnets across multiple Availability Zones (no HA)
- Overly permissive security group rules (0.0.0.0/0 for SSH is dangerous)
- Confusing security groups (stateful) with NACLs (stateless)
- Running out of IP addresses by using too small CIDR blocks (/28, /27)

## Practical Applications

- Hosting web applications (public load balancers, private app servers)
- Multi-tier architectures (web, app, database layers isolated)
- Hybrid cloud connectivity (VPN or Direct Connect to on-premises)
- Microservices architectures (isolated subnets per service)
- Compliance requirements (private subnets for sensitive data)

## References

- [AWS VPC Documentation](https://docs.aws.amazon.com/vpc/)
- [AWS VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/)
- [AWS VPC Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html)
- [AWS Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)
- [CIDR.xyz Calculator](https://cidr.xyz/) - Subnet calculator tool

---

## Greater Detail

### Advanced Concepts

- **CIDR Block Planning:**
  ```
  Common VPC sizes:
  /16 = 65,536 IPs  → Large organizations, many services
  /20 = 4,096 IPs   → Medium-sized applications
  /24 = 256 IPs     → Small applications, dev environments
  
  Reserved IPs per subnet (AWS uses 5):
  10.0.1.0   - Network address
  10.0.1.1   - VPC router
  10.0.1.2   - DNS server
  10.0.1.3   - Future use
  10.0.1.255 - Broadcast address
  
  Usable: 256 - 5 = 251 IPs per /24 subnet
  ```

- **VPC Peering (Connect Multiple VPCs):**
  ```
  VPC A (10.0.0.0/16) <--Peering--> VPC B (172.16.0.0/16)
  
  Route Table (VPC A):
  Destination       Target
  10.0.0.0/16      local
  172.16.0.0/16    pcx-123abc (peering connection)
  
  Use cases:
  - Connect production and staging VPCs
  - Share resources across accounts
  - Multi-region applications
  
  Limitations:
  - No transitive peering (A-B-C requires A-B and A-C connections)
  - CIDR blocks cannot overlap
  ```

- **VPC Endpoints (Private AWS Service Access):**
  ```
  Without VPC Endpoint:
  Private EC2 → NAT Gateway → Internet → S3 (public endpoint)
  
  With VPC Endpoint (Interface or Gateway):
  Private EC2 → VPC Endpoint → S3 (private connection)
  
  Types:
  1. Gateway Endpoints: S3, DynamoDB (free, route table entry)
  2. Interface Endpoints: Most AWS services (ENI in subnet, costs $)
  
  Benefits:
  - No internet gateway or NAT required
  - Lower latency, better security
  - Reduced data transfer costs
  ```

- **Network ACLs vs Security Groups:**
  ```
  Network ACLs (Subnet level):
  - Stateless (must allow both inbound and outbound)
  - Numbered rules (evaluated in order)
  - Can DENY traffic explicitly
  - Applied to entire subnet
  
  Security Groups (Instance level):
  - Stateful (return traffic automatic)
  - All rules evaluated
  - Can only ALLOW (default deny)
  - Applied to specific instances/ENIs
  
  Example NACL (Stateless):
  Inbound:
  100  Allow TCP 80  0.0.0.0/0
  110  Allow TCP 443 0.0.0.0/0
  *    Deny All
  
  Outbound:
  100  Allow TCP 1024-65535 0.0.0.0/0  (ephemeral ports!)
  *    Deny All
  ```

- **VPN and Direct Connect:**
  ```
  Site-to-Site VPN:
  On-premises ↔ Virtual Private Gateway ↔ VPC
  - Setup: Hours
  - Speed: Up to 1.25 Gbps per tunnel
  - Cost: Low (~$0.05/hour + data transfer)
  - Use case: Quick hybrid cloud setup
  
  AWS Direct Connect:
  On-premises ↔ Direct Connect Location ↔ VPC
  - Setup: Weeks/months
  - Speed: 1 Gbps to 100 Gbps
  - Cost: Higher (port hours + data transfer)
  - Use case: High bandwidth, consistent latency
  ```

- **Flow Logs (Network Traffic Monitoring):**
  ```
  VPC Flow Logs capture:
  - Source/destination IPs
  - Ports and protocols
  - Bytes transferred
  - Accept/reject decisions
  
  Example log entry:
  2 123456789 eni-abc123 10.0.1.50 172.217.14.206 443 52000 6 25 5000 1637582400 1637582460 ACCEPT OK
  
  Useful for:
  - Debugging connectivity issues
  - Security analysis (detecting attacks)
  - Compliance and auditing
  ```

- **Multi-AZ High Availability Pattern:**
  ```
  Region: us-east-1
  
  AZ-1 (us-east-1a)                AZ-2 (us-east-1b)
  ├─ Public Subnet                 ├─ Public Subnet
  │  └─ ALB (primary)              │  └─ ALB (secondary)
  │  └─ NAT Gateway                │  └─ NAT Gateway
  ├─ Private Subnet                ├─ Private Subnet
  │  └─ EC2 Auto Scaling           │  └─ EC2 Auto Scaling
  └─ DB Subnet                     └─ DB Subnet
     └─ RDS Primary                   └─ RDS Standby
  
  If AZ-1 fails:
  - ALB routes to AZ-2
  - Auto Scaling launches in AZ-2
  - RDS fails over to standby
  ```

- **Cost Optimization:**
  ```
  Expensive:
  - NAT Gateway: ~$0.045/hour + $0.045/GB processed
  - VPC Endpoints (Interface): ~$0.01/hour per AZ
  - Data transfer between AZs: $0.01/GB
  
  Savings:
  - Use single NAT Gateway (not per AZ) for non-critical
  - VPC Gateway Endpoints free (S3, DynamoDB)
  - Keep traffic within same AZ when possible
  - Use VPC Endpoints instead of NAT for AWS services
  ```

- **Terraform Example (Infrastructure as Code):**
  ```hcl
  resource "aws_vpc" "main" {
    cidr_block = "10.0.0.0/16"
    enable_dns_hostnames = true
    tags = { Name = "production-vpc" }
  }
  
  resource "aws_subnet" "public" {
    vpc_id = aws_vpc.main.id
    cidr_block = "10.0.1.0/24"
    availability_zone = "us-east-1a"
    map_public_ip_on_launch = true
  }
  
  resource "aws_internet_gateway" "main" {
    vpc_id = aws_vpc.main.id
  }
  
  resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id
    route {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.main.id
    }
  }
  ```

- **Best Practices:**
  - Always use multiple AZs for production (minimum 2)
  - Reserve IP space for growth (start with /16, use /24 subnets)
  - Use separate subnets for different tiers (web, app, database)
  - Enable VPC Flow Logs for troubleshooting and security
  - Use descriptive tags (Environment, Application, Owner)
  - Document your CIDR allocation strategy
  - Test disaster recovery (simulate AZ failure)
  - Use least privilege for security groups (specific IPs/ports)