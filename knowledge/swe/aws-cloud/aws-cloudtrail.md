# AWS CloudTrail: Complete Overview

AWS CloudTrail is a governance, compliance, and auditing service that **records API activity** across your AWS account. Think of it as a security camera system for your AWS infrastructure — every API call (who did what, when, and from where) gets logged. It's essential for security investigations, compliance audits, and operational troubleshooting.

## Key Points

- **Records API Calls:** Every action in AWS (console, CLI, SDK, service-to-service) is captured as an "event."
- **Enabled by Default:** CloudTrail records the last 90 days of management events for free (Event History).
- **Trails:** Custom configurations that deliver logs to S3 (and optionally CloudWatch Logs) for long-term retention.
- **Three Event Types:** Management events, data events, and Insights events.
- **Multi-Region:** A single trail can capture activity across all AWS regions.

## Step-by-Step Explanation & Examples

### 1. How It Works

Every AWS API call flows through CloudTrail and gets recorded as a JSON event. The lifecycle looks like:

```
User/Service makes API call
        ↓
CloudTrail captures the event
        ↓
Event appears in Event History (90-day default)
        ↓
If a Trail is configured → logs delivered to S3 / CloudWatch
        ↓
Optional: Insights analyzes for anomalies
```

### 2. Event Structure

Each event is a JSON object with metadata about the API call. This is the "footage" from your security camera.

```json
{
  "eventVersion": "1.09",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDACKCEVSQ6C2EXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/alice",
    "accountId": "123456789012",
    "userName": "alice"
  },
  "eventTime": "2025-03-15T14:32:07Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "DeleteBucket",
  "awsRegion": "us-west-2",
  "sourceIPAddress": "198.51.100.42",
  "userAgent": "aws-cli/2.15.0",
  "requestParameters": {
    "bucketName": "my-important-bucket"
  },
  "responseElements": null,
  "errorCode": null,
  "errorMessage": null
}
```

From this single event, you can answer: **who** (alice), **what** (DeleteBucket), **when** (2025-03-15T14:32:07Z), **where** (us-west-2), and **how** (aws-cli from IP 198.51.100.42).

### 3. The Three Event Types

| Type | What It Captures | Examples | Default |
|---|---|---|---|
| **Management Events** | Control plane operations (resource creation, IAM changes, config changes) | `CreateBucket`, `RunInstances`, `AttachRolePolicy` | Logged by default |
| **Data Events** | Data plane operations (high-volume reads/writes on resources) | `GetObject`, `PutObject`, `Invoke` (Lambda) | **Not logged by default** — must enable per trail |
| **Insights Events** | Anomalous activity patterns detected by CloudTrail | Unusual spike in `RunInstances` calls | Optional add-on |

**Analogy:** Management events are like logging who opens and closes doors in a building. Data events are like logging every item someone picks up or puts down inside a room — much higher volume, so you opt in selectively.

### 4. Creating a Trail (CLI)

```bash
# Create a trail that logs to S3 across all regions
aws cloudtrail create-trail \
  --name my-org-trail \
  --s3-bucket-name my-cloudtrail-logs-bucket \
  --is-multi-region-trail \
  --enable-log-file-validation

# Start logging
aws cloudtrail start-logging --name my-org-trail

# Enable data events for a specific S3 bucket
aws cloudtrail put-event-selectors \
  --trail-name my-org-trail \
  --event-selectors '[
    {
      "ReadWriteType": "All",
      "IncludeManagementEvents": true,
      "DataResources": [
        {
          "Type": "AWS::S3::Object",
          "Values": ["arn:aws:s3:::my-important-bucket/"]
        }
      ]
    }
  ]'
```

### 5. Creating a Trail (CloudFormation / SAM)

```yaml
Resources:
  CloudTrailLogsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-cloudtrail-logs-bucket
      LifecycleConfiguration:
        Rules:
          - Id: ArchiveOldLogs
            Status: Enabled
            Transitions:
              - StorageClass: GLACIER
                TransitionInDays: 90

  CloudTrailBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref CloudTrailLogsBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: AllowCloudTrailWrite
            Effect: Allow
            Principal:
              Service: cloudtrail.amazonaws.com
            Action: s3:PutObject
            Resource: !Sub "${CloudTrailLogsBucket.Arn}/*"
            Condition:
              StringEquals:
                s3:x-amz-acl: bucket-owner-full-control
          - Sid: AllowCloudTrailACLCheck
            Effect: Allow
            Principal:
              Service: cloudtrail.amazonaws.com
            Action: s3:GetBucketAcl
            Resource: !GetAtt CloudTrailLogsBucket.Arn

  MyTrail:
    Type: AWS::CloudTrail::Trail
    DependsOn: CloudTrailBucketPolicy
    Properties:
      TrailName: my-org-trail
      S3BucketName: !Ref CloudTrailLogsBucket
      IsMultiRegionTrail: true
      EnableLogFileValidation: true
      IsLogging: true
```

### 6. Querying with Athena

For long-term logs in S3, you can query them with Athena using SQL — much faster than downloading and grepping JSON files.

```sql
-- Find all IAM policy changes in the last 7 days
SELECT
  eventTime,
  userIdentity.userName,
  eventName,
  sourceIPAddress,
  requestParameters
FROM cloudtrail_logs
WHERE eventSource = 'iam.amazonaws.com'
  AND eventName LIKE '%Policy%'
  AND eventTime > date_add('day', -7, now())
ORDER BY eventTime DESC;
```

```sql
-- Find who deleted a specific S3 bucket
SELECT
  eventTime,
  userIdentity.arn,
  sourceIPAddress,
  userAgent
FROM cloudtrail_logs
WHERE eventName = 'DeleteBucket'
  AND requestParameters LIKE '%my-important-bucket%';
```

### 7. CloudWatch Alarms on Sensitive Actions

Pair CloudTrail with CloudWatch Logs to get real-time alerts on dangerous activity.

```json
// CloudWatch Metric Filter pattern
// Triggers on root account usage
{ $.userIdentity.type = "Root" && $.eventType != "AwsServiceEvent" }
```

```yaml
# CloudFormation for alert on root login
RootActivityAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: RootAccountUsage
    MetricName: RootAccountUsageCount
    Namespace: CloudTrailMetrics
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 1
    Threshold: 1
    ComparisonOperator: GreaterThanOrEqualToThreshold
    AlarmActions:
      - !Ref SecuritySNSTopic
```

## Common Pitfalls

- **Assuming Event History is enough.** It only retains 90 days and only management events. Create a trail for long-term, comprehensive logging.
- **Not enabling log file validation.** Without it, you can't cryptographically verify logs haven't been tampered with — critical for compliance.
- **Enabling data events on everything.** S3 `GetObject` events on a high-traffic bucket can generate massive log volume and cost. Be selective.
- **Forgetting S3 bucket policies.** CloudTrail needs explicit permission to write to your S3 bucket — a missing bucket policy is the #1 setup failure.
- **Ignoring cross-account/org trails.** In multi-account setups, use AWS Organizations trails to centralize logging instead of configuring per-account.

## Practical Applications

- **Security Investigation:** "Who deleted that production database at 3 AM?" — query CloudTrail logs by `eventName`, `eventTime`, and `userIdentity`.
- **Compliance Auditing:** Prove to auditors that only authorized users access sensitive resources (SOC 2, HIPAA, PCI-DSS all reference audit logging).
- **Anomaly Detection:** CloudTrail Insights flags unusual patterns — e.g., a sudden spike in `RunInstances` calls could indicate compromised credentials.
- **Operational Debugging:** Trace failed API calls (`errorCode` field) to understand why a deployment or automation broke.
- **Automated Remediation:** CloudTrail → EventBridge → Lambda pipeline to auto-respond to risky actions (e.g., revert a public S3 bucket policy).

## References

- [AWS CloudTrail Documentation](https://docs.aws.amazon.com/cloudtrail/latest/userguide/)
- [CloudTrail Event Reference](https://docs.aws.amazon.com/cloudtrail/latest/userguide/cloudtrail-event-reference.html)
- [Querying CloudTrail with Athena](https://docs.aws.amazon.com/athena/latest/ug/cloudtrail-logs.html)
- [CloudTrail Pricing](https://aws.amazon.com/cloudtrail/pricing/)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)

---

## Greater Detail

### Advanced Concepts

- **Organization Trails:** A single trail across all accounts in an AWS Organization. Centralizes audit logging and simplifies compliance — the recommended approach for multi-account setups.
- **CloudTrail Lake:** A managed query engine that lets you run SQL queries directly on CloudTrail events without setting up Athena + S3. Simplifies investigation workflows but costs more at scale.
- **Log File Validation:** CloudTrail creates a SHA-256 digest file every hour. You can use `aws cloudtrail validate-logs` to verify no log files were modified or deleted — critical for forensic integrity.
- **EventBridge Integration:** CloudTrail events can trigger EventBridge rules in near real-time, enabling automated responses (e.g., revoke credentials when `ConsoleLogin` occurs from an unexpected country).
- **Cost Optimization:** Management events for the first trail are free. Data events and additional trails incur charges. Use event selectors to log only the specific resources and operations you need rather than blanket `All` data events.