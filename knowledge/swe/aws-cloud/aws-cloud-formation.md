# AWS CloudFormation: Complete Overview

AWS CloudFormation is an Infrastructure as Code (IaC) service that lets you define and provision AWS resources using declarative templates written in YAML or JSON. Instead of manually clicking through the AWS console, you describe your entire infrastructure in a template file, and CloudFormation creates, updates, and deletes resources in the correct order. Think of it as a recipe for your infrastructure—you write down all the ingredients (resources) and instructions (configurations), and CloudFormation cooks up your environment exactly as specified.

## Key Points

- **Purpose:** Automate AWS infrastructure provisioning with code
- **Format:** Templates written in YAML (preferred) or JSON
- **Stacks:** A collection of resources created from a single template
- **Declarative:** You describe WHAT you want, not HOW to create it
- **State Management:** CloudFormation tracks resource state automatically

## Step-by-Step Explanation & Examples

1. **Basic Template Structure**

   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Description: My first CloudFormation template
   
   Parameters:
     # Input values passed at stack creation
   
   Mappings:
     # Static lookup tables
   
   Conditions:
     # Conditional logic for resource creation
   
   Resources:
     # AWS resources to create (required)
   
   Outputs:
     # Values to export/display after creation
   ```

2. **Simple S3 Bucket**

   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Description: Create an S3 bucket
   
   Resources:
     MyBucket:
       Type: AWS::S3::Bucket
       Properties:
         BucketName: my-unique-bucket-name-12345
         VersioningConfiguration:
           Status: Enabled
         Tags:
           - Key: Environment
             Value: Production
   
   Outputs:
     BucketArn:
       Description: ARN of the created bucket
       Value: !GetAtt MyBucket.Arn
   ```

3. **Using Parameters (Dynamic Inputs)**

   ```yaml
   Parameters:
     EnvironmentType:
       Type: String
       Default: dev
       AllowedValues:
         - dev
         - staging
         - prod
       Description: Environment type
     
     InstanceType:
       Type: String
       Default: t3.micro
       AllowedValues:
         - t3.micro
         - t3.small
         - t3.medium
   
   Resources:
     WebServer:
       Type: AWS::EC2::Instance
       Properties:
         InstanceType: !Ref InstanceType
         ImageId: ami-0abcdef1234567890
         Tags:
           - Key: Environment
             Value: !Ref EnvironmentType
   ```
   
   **Deploy:** `aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml --parameters ParameterKey=EnvironmentType,ParameterValue=prod`

4. **Intrinsic Functions (Built-in Helpers)**

   ```yaml
   Resources:
     MyBucket:
       Type: AWS::S3::Bucket
       Properties:
         # !Ref - Reference parameter or resource
         BucketName: !Ref BucketNameParam
         
     MyLambda:
       Type: AWS::Lambda::Function
       Properties:
         FunctionName: !Sub '${EnvironmentType}-my-function'  # String substitution
         
         # !GetAtt - Get attribute from another resource
         Environment:
           Variables:
             BUCKET_ARN: !GetAtt MyBucket.Arn
         
         # !Join - Concatenate strings
         Description: !Join
           - ' '
           - - 'Lambda for'
             - !Ref EnvironmentType
             - 'environment'
   
   Outputs:
     # !If - Conditional value
     Endpoint:
       Value: !If [IsProd, 'https://api.example.com', 'https://dev-api.example.com']
   ```

5. **VPC with Public/Private Subnets**

   ```yaml
   Resources:
     VPC:
       Type: AWS::EC2::VPC
       Properties:
         CidrBlock: 10.0.0.0/16
         EnableDnsHostnames: true
         Tags:
           - Key: Name
             Value: !Sub '${AWS::StackName}-vpc'
     
     PublicSubnet:
       Type: AWS::EC2::Subnet
       Properties:
         VpcId: !Ref VPC
         CidrBlock: 10.0.1.0/24
         AvailabilityZone: !Select [0, !GetAZs '']
         MapPublicIpOnLaunch: true
     
     PrivateSubnet:
       Type: AWS::EC2::Subnet
       Properties:
         VpcId: !Ref VPC
         CidrBlock: 10.0.2.0/24
         AvailabilityZone: !Select [0, !GetAZs '']
     
     InternetGateway:
       Type: AWS::EC2::InternetGateway
     
     AttachGateway:
       Type: AWS::EC2::VPCGatewayAttachment
       Properties:
         VpcId: !Ref VPC
         InternetGatewayId: !Ref InternetGateway
     
     PublicRouteTable:
       Type: AWS::EC2::RouteTable
       Properties:
         VpcId: !Ref VPC
     
     PublicRoute:
       Type: AWS::EC2::Route
       DependsOn: AttachGateway
       Properties:
         RouteTableId: !Ref PublicRouteTable
         DestinationCidrBlock: 0.0.0.0/0
         GatewayId: !Ref InternetGateway
   ```

6. **Conditions (Environment-Based Logic)**

   ```yaml
   Parameters:
     EnvironmentType:
       Type: String
       AllowedValues: [dev, prod]
   
   Conditions:
     IsProd: !Equals [!Ref EnvironmentType, prod]
     IsDev: !Not [!Equals [!Ref EnvironmentType, prod]]
   
   Resources:
     ProdDatabase:
       Type: AWS::RDS::DBInstance
       Condition: IsProd  # Only created in prod
       Properties:
         DBInstanceClass: db.r5.large
         MultiAZ: true
     
     DevDatabase:
       Type: AWS::RDS::DBInstance
       Condition: IsDev  # Only created in dev
       Properties:
         DBInstanceClass: db.t3.micro
         MultiAZ: false
   ```

## Common Pitfalls

- Hardcoding values instead of using parameters (not reusable)
- Circular dependencies between resources (stack creation fails)
- Forgetting `DependsOn` when implicit dependencies aren't detected
- Not using `!Sub` for string interpolation (cleaner than `!Join`)
- Deleting resources manually that are managed by CloudFormation (drift)
- Not enabling termination protection on production stacks
- Ignoring stack events when debugging failures (shows exact error)
- Using resource names that must be globally unique (S3 buckets)

## Practical Applications

- Repeatable environment provisioning (dev, staging, prod from same template)
- Multi-region deployments (StackSets)
- Disaster recovery (rebuild infrastructure from templates)
- Compliance and auditing (infrastructure defined in version control)
- CI/CD pipelines (automated infrastructure updates)

## References

- [AWS CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
- [CloudFormation Resource Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)
- [Intrinsic Functions Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html)
- [AWS CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [cfn-lint](https://github.com/aws-cloudformation/cfn-lint) - Template validator

---

## Greater Detail

### Advanced Concepts

- **Stack Lifecycle:**
  ```
  CREATE_IN_PROGRESS → CREATE_COMPLETE (success)
                     → CREATE_FAILED → ROLLBACK_IN_PROGRESS → ROLLBACK_COMPLETE
  
  UPDATE_IN_PROGRESS → UPDATE_COMPLETE (success)
                     → UPDATE_FAILED → UPDATE_ROLLBACK_IN_PROGRESS → UPDATE_ROLLBACK_COMPLETE
  
  DELETE_IN_PROGRESS → DELETE_COMPLETE (success)
                     → DELETE_FAILED (manual intervention needed)
  
  Debugging: Check "Events" tab for specific resource failures
  ```

- **Change Sets (Preview Before Update):**
  ```bash
  # Create change set
  aws cloudformation create-change-set \
    --stack-name my-stack \
    --template-body file://updated-template.yaml \
    --change-set-name my-changes
  
  # Review changes
  aws cloudformation describe-change-set \
    --stack-name my-stack \
    --change-set-name my-changes
  
  # Execute if changes look good
  aws cloudformation execute-change-set \
    --stack-name my-stack \
    --change-set-name my-changes
  
  Shows: Add, Modify, Remove actions per resource
  ```

- **Nested Stacks (Modular Templates):**
  ```yaml
  # Parent template (main.yaml)
  Resources:
    VPCStack:
      Type: AWS::CloudFormation::Stack
      Properties:
        TemplateURL: https://s3.amazonaws.com/mybucket/vpc.yaml
        Parameters:
          Environment: !Ref Environment
    
    AppStack:
      Type: AWS::CloudFormation::Stack
      DependsOn: VPCStack
      Properties:
        TemplateURL: https://s3.amazonaws.com/mybucket/app.yaml
        Parameters:
          VpcId: !GetAtt VPCStack.Outputs.VpcId
  
  Benefits:
  - Reusable components
  - Overcome 500 resource limit per stack
  - Separate concerns (networking, compute, database)
  ```

- **Cross-Stack References (Exports/Imports):**
  ```yaml
  # Stack A: VPC Stack
  Outputs:
    VpcId:
      Description: VPC ID for other stacks
      Value: !Ref VPC
      Export:
        Name: !Sub '${AWS::StackName}-VpcId'
  
  # Stack B: Application Stack
  Resources:
    AppSecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        VpcId: !ImportValue 'vpc-stack-VpcId'  # Import from Stack A
  
  Warning: Cannot delete Stack A while Stack B references its exports
  ```

- **CloudFormation Macros and Transforms:**
  ```yaml
  # AWS::Serverless transform (SAM)
  AWSTemplateFormatVersion: '2010-09-09'
  Transform: AWS::Serverless-2016-10-31
  
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function  # Simplified Lambda syntax
      Properties:
        Handler: index.handler
        Runtime: nodejs18.x
        CodeUri: ./src
        Events:
          Api:
            Type: Api
            Properties:
              Path: /hello
              Method: get
  
  # AWS::Include (import snippets)
  Transform:
    Name: AWS::Include
    Parameters:
      Location: s3://mybucket/common-resources.yaml
  ```

- **Drift Detection (Find Manual Changes):**
  ```bash
  # Detect drift
  aws cloudformation detect-stack-drift --stack-name my-stack
  
  # Check drift status
  aws cloudformation describe-stack-drift-detection-status \
    --stack-drift-detection-id <detection-id>
  
  # View drifted resources
  aws cloudformation describe-stack-resource-drifts \
    --stack-name my-stack
  
  Drift states:
  - IN_SYNC: Resource matches template
  - MODIFIED: Resource changed outside CloudFormation
  - DELETED: Resource deleted manually
  ```

- **StackSets (Multi-Account/Multi-Region):**
  ```yaml
  # Deploy same template across accounts/regions
  aws cloudformation create-stack-set \
    --stack-set-name security-baseline \
    --template-body file://security.yaml \
    --permission-model SERVICE_MANAGED
  
  aws cloudformation create-stack-instances \
    --stack-set-name security-baseline \
    --regions us-east-1 eu-west-1 ap-southeast-1 \
    --deployment-targets OrganizationalUnitIds=ou-abc123
  
  Use cases:
  - Compliance (security groups, IAM policies)
  - Logging (CloudTrail in all accounts)
  - Networking (VPCs per region)
  ```

- **Custom Resources (Extend CloudFormation):**
  ```yaml
  # Call Lambda for custom logic
  Resources:
    CustomLogic:
      Type: Custom::MyCustomResource
      Properties:
        ServiceToken: !GetAtt CustomLambda.Arn
        CustomParam: some-value
    
    CustomLambda:
      Type: AWS::Lambda::Function
      Properties:
        Handler: index.handler
        Runtime: python3.9
        Code:
          ZipFile: |
            import cfnresponse
            def handler(event, context):
                # Custom logic here
                cfnresponse.send(event, context, cfnresponse.SUCCESS, {
                    'Result': 'Custom resource created'
                })
  
  Use cases:
  - Lookup AMI IDs dynamically
  - Create resources not supported by CloudFormation
  - Run custom validation
  ```

- **Resource Policies (Prevent Deletion/Updates):**
  ```yaml
  # Stack Policy (apply at stack level)
  {
    "Statement": [
      {
        "Effect": "Deny",
        "Action": "Update:Replace",
        "Principal": "*",
        "Resource": "LogicalResourceId/ProductionDatabase"
      },
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      }
    ]
  }
  
  # DeletionPolicy (per resource)
  Resources:
    ProductionDatabase:
      Type: AWS::RDS::DBInstance
      DeletionPolicy: Retain      # Keep resource when stack deleted
      UpdateReplacePolicy: Snapshot  # Snapshot before replacement
  
  Options: Delete (default), Retain, Snapshot (RDS, EBS)
  ```

- **Debugging Failed Stacks:**
  ```
  1. Check Events tab in CloudFormation console
     → Shows chronological resource creation/failure
  
  2. Look for status: CREATE_FAILED or UPDATE_FAILED
     → Status reason shows specific error message
  
  3. Common errors:
     - "Resource limit exceeded" → Service quotas
     - "Access Denied" → IAM permissions
     - "already exists" → Resource name conflict
     - "does not exist" → Missing dependency
  
  4. Enable termination protection for prod:
     aws cloudformation update-termination-protection \
       --stack-name prod-stack \
       --enable-termination-protection
  ```

- **CloudFormation vs Terraform:**
  ```
  CloudFormation:
  + Native AWS integration
  + No state file management
  + Free to use
  + Drift detection built-in
  - AWS only
  - YAML/JSON verbose syntax
  
  Terraform:
  + Multi-cloud support
  + HCL syntax (more readable)
  + Larger community/modules
  + Better state manipulation
  - Requires state file management
  - Costs (Terraform Cloud)
  ```

- **Best Practices:**
  - Use version control (Git) for all templates
  - Validate templates before deployment: `aws cloudformation validate-template`
  - Use `cfn-lint` for linting and catching errors early
  - Parameterize everything environment-specific
  - Use nested stacks for large infrastructures (>100 resources)
  - Enable termination protection on production stacks
  - Use change sets to preview updates before applying
  - Tag all resources for cost allocation and management
  - Store secrets in Secrets Manager/Parameter Store, not templates
  - Use `DeletionPolicy: Retain` for databases and critical resources