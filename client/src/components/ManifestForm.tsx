
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Server, Code, StickyNote } from 'lucide-react';
import type { CreateManifestInput, TargetPlatform, KeyTechnology } from '../../../server/src/schema';

interface ManifestFormProps {
  onSubmit: (data: CreateManifestInput) => Promise<void>;
  isLoading?: boolean;
}

const TARGET_PLATFORMS: TargetPlatform[] = [
  'AWS',
  'Azure',
  'GCP',
  'On-Premise',
  'Kubernetes',
  'Fly.io',
  'Local Dev'
];

const KEY_TECHNOLOGIES: KeyTechnology[] = [
  'Apache Iceberg',
  'Delta Lake',
  'Apache Hudi',
  'Trino',
  'Apache Spark',
  'DuckDB',
  'Apache Airflow',
  'dbt',
  'AWS S3/Minio',
  'Azure Blob Storage',
  'Google Cloud Storage',
  'Docker',
  'Kubernetes'
];

function generateManifestBoilerplate(
  targetPlatform: TargetPlatform,
  keyTechnologies: KeyTechnology[]
): string {
  const techSet = new Set(keyTechnologies);

  switch (targetPlatform) {
    case 'Kubernetes':
      if (techSet.has('Apache Iceberg')) {
        return `# Kubernetes Manifest for Apache Iceberg Deployment
apiVersion: v1
kind: ConfigMap
metadata:
  name: iceberg-config
data:
  # Iceberg catalog configuration
  catalog.warehouse: "s3://your-bucket/warehouse/"
  catalog.uri: "jdbc:postgresql://postgres:5432/iceberg"
  # S3 storage configuration
  s3.endpoint: "https://s3.amazonaws.com"
  s3.access-key-id: "\${AWS_ACCESS_KEY_ID}"
  s3.secret-access-key: "\${AWS_SECRET_ACCESS_KEY}"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iceberg-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: iceberg-service
  template:
    metadata:
      labels:
        app: iceberg-service
    spec:
      containers:
      - name: iceberg
        image: apache/iceberg:latest
        # TODO: Configure Iceberg catalog and storage settings
        # TODO: Add resource limits and requests
        # TODO: Configure persistent volumes for metadata`;
      }

      if (techSet.has('Apache Spark')) {
        return `# Kubernetes Manifest for Apache Spark Application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: spark-service-account
  namespace: default

---
apiVersion: sparkoperator.k8s.io/v1beta2
kind: SparkApplication
metadata:
  name: spark-lakehouse-job
spec:
  type: Scala
  mode: cluster
  image: "apache/spark:3.4.0"
  imagePullPolicy: Always
  mainClass: com.example.SparkLakehouseApp
  mainApplicationFile: "s3a://your-bucket/spark-app.jar"
  sparkVersion: "3.4.0"
  restartPolicy:
    type: Never
  driver:
    cores: 1
    coreLimit: "1200m"
    memory: "2g"
    serviceAccount: spark-service-account
  executor:
    cores: 2
    instances: 2
    memory: "4g"
  # TODO: Configure Spark SQL catalogs for lakehouse tables
  # TODO: Add environment variables for storage credentials
  # TODO: Configure dynamic allocation settings`;
      }

      if (techSet.has('Docker')) {
        return `# Simple Kubernetes Pod for Docker Container
apiVersion: v1
kind: Pod
metadata:
  name: lakehouse-app
  labels:
    app: lakehouse-app
spec:
  containers:
  - name: app-container
    image: your-registry/lakehouse-app:latest
    ports:
    - containerPort: 8080
    env:
    - name: DATABASE_URL
      value: "postgresql://postgres:5432/lakehouse"
    # TODO: Add resource limits and requests
    # TODO: Configure persistent volumes if needed
    # TODO: Add health checks and readiness probes
    
---
apiVersion: v1
kind: Service
metadata:
  name: lakehouse-app-service
spec:
  selector:
    app: lakehouse-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP`;
      }

      return `# Generic Kubernetes Deployment Manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lakehouse-deployment
  labels:
    app: lakehouse
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lakehouse
  template:
    metadata:
      labels:
        app: lakehouse
    spec:
      containers:
      - name: lakehouse-container
        image: your-registry/lakehouse:latest
        ports:
        - containerPort: 8080
        # TODO: Configure environment variables
        # TODO: Add resource limits and requests
        # TODO: Configure storage volumes

---
apiVersion: v1
kind: Service
metadata:
  name: lakehouse-service
spec:
  selector:
    app: lakehouse
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer`;

    case 'Local Dev':
      if (techSet.has('Docker')) {
        return `# Docker Compose for Local Development
version: '3.8'

services:
  lakehouse-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:5432/lakehouse
      - ENVIRONMENT=development
    depends_on:
      - postgres
      - minio
    volumes:
      - ./data:/app/data
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lakehouse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:

# TODO: Add additional services for your lakehouse stack
# TODO: Configure networking and service discovery
# TODO: Add development tools and utilities`;
      }

      if (techSet.has('DuckDB')) {
        return `# Local DuckDB Development Setup

## Python Environment Setup
\`\`\`bash
# Create virtual environment
python -m venv lakehouse-env
source lakehouse-env/bin/activate  # On Windows: lakehouse-env\\Scripts\\activate

# Install dependencies
pip install duckdb pandas pyarrow polars
\`\`\`

## Sample DuckDB Configuration
\`\`\`python
import duckdb

# Initialize DuckDB with lakehouse extensions
conn = duckdb.connect('lakehouse.db')

# Install and load extensions
conn.execute("INSTALL httpfs;")
conn.execute("LOAD httpfs;")
conn.execute("INSTALL parquet;")
conn.execute("LOAD parquet;")

# Configure S3-compatible storage (MinIO for local dev)
conn.execute("""
    SET s3_region='us-east-1';
    SET s3_url_style='path';
    SET s3_endpoint='localhost:9000';
    SET s3_access_key_id='minioadmin';
    SET s3_secret_access_key='minioadmin';
    SET s3_use_ssl=false;
""")

# Create external tables
conn.execute("""
    CREATE TABLE events AS 
    SELECT * FROM read_parquet('s3://lakehouse/data/events/*.parquet');
""")
\`\`\`

# TODO: Set up data ingestion pipelines
# TODO: Configure schema evolution and versioning
# TODO: Add data quality checks and validation`;
      }

      return `# Local Development Environment Setup

## Prerequisites
- Docker and Docker Compose
- Python 3.9+
- Node.js 18+

## Environment Configuration
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd lakehouse-project

# Copy environment template
cp .env.example .env

# Start local services
docker-compose up -d

# Initialize database
npm run db:migrate
npm run db:seed
\`\`\`

## Development Workflow
1. Start the development server: \`npm run dev\`
2. Run tests: \`npm test\`
3. Build for production: \`npm run build\`

# TODO: Configure local data sources
# TODO: Set up development database
# TODO: Add monitoring and debugging tools`;

    case 'AWS':
      if (techSet.has('Apache Iceberg') && techSet.has('AWS S3/Minio')) {
        return `# AWS Infrastructure for Apache Iceberg Lakehouse

## S3 Bucket Configuration
\`\`\`yaml
Resources:
  LakehouseBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "\${AWS::StackName}-lakehouse-\${AWS::AccountId}"
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
\`\`\`

## Iceberg Catalog Setup
\`\`\`python
# Iceberg catalog configuration
catalog_config = {
    'type': 'glue',
    'warehouse': 's3://your-lakehouse-bucket/warehouse/',
    'glue.region': 'us-east-1',
    'glue.catalog-id': 'your-account-id'
}

# Table creation example
from pyiceberg.catalog import load_catalog
catalog = load_catalog("glue", **catalog_config)

# Create namespace
catalog.create_namespace("lakehouse")

# Create table schema
schema = Schema([
    NestedField(1, "id", IntegerType(), required=True),
    NestedField(2, "timestamp", TimestampType(), required=True),
    NestedField(3, "data", StringType(), required=False)
])
\`\`\`

# TODO: Configure Glue Data Catalog integration
# TODO: Set up IAM roles and policies
# TODO: Configure AWS Lake Formation permissions`;
      }

      if (techSet.has('Apache Airflow')) {
        return `# AWS Airflow DAG for Lakehouse ETL Pipeline

from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.amazon.aws.operators.s3 import S3ListOperator
from airflow.providers.amazon.aws.operators.glue import GlueJobOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator

default_args = {
    'owner': 'lakehouse-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'lakehouse_etl_pipeline',
    default_args=default_args,
    description='Daily ETL pipeline for lakehouse data processing',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    tags=['lakehouse', 'etl', 'daily']
)

# List new files in S3
list_s3_files = S3ListOperator(
    task_id='list_new_files',
    bucket='your-data-bucket',
    prefix='raw-data/',
    delimiter='/',
    aws_conn_id='aws_default',
    dag=dag
)

# Process data with Glue
process_data = GlueJobOperator(
    task_id='process_raw_data',
    job_name='lakehouse-data-processor',
    script_location='s3://your-scripts-bucket/etl_script.py',
    s3_bucket='your-temp-bucket',
    iam_role_name='GlueServiceRole',
    create_job_kwargs={'GlueVersion': '3.0'},
    dag=dag
)

# Update metadata
update_catalog = PostgresOperator(
    task_id='update_metadata_catalog',
    postgres_conn_id='lakehouse_metadata',
    sql='CALL update_table_statistics();',
    dag=dag
)

list_s3_files >> process_data >> update_catalog

# TODO: Add data quality checks
# TODO: Configure monitoring and alerting
# TODO: Add incremental processing logic`;
      }

      return `# AWS CloudFormation / Terraform Configuration

## Infrastructure as Code Template
\`\`\`yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Lakehouse Infrastructure Stack'

Parameters:
  Environment:
    Type: String
    Default: 'dev'
    AllowedValues: ['dev', 'staging', 'prod']

Resources:
  # S3 Bucket for data storage
  DataLakeBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "lakehouse-data-\${Environment}-\${AWS::AccountId}"
      
  # IAM Role for lakehouse services
  LakehouseServiceRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: glue.amazonaws.com
            Action: sts:AssumeRole
            
  # Glue Database
  LakehouseDatabase:
    Type: AWS::Glue::Database
    Properties:
      CatalogId: !Ref AWS::AccountId
      DatabaseInput:
        Name: !Sub "lakehouse_\${Environment}"
        Description: "Lakehouse metadata database"
\`\`\`

# TODO: Add VPC and networking configuration
# TODO: Configure security groups and NACLs
# TODO: Set up monitoring with CloudWatch`;

    case 'Azure':
      return `# Azure Resource Manager Template for Lakehouse

\`\`\`json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environment": {
      "type": "string",
      "defaultValue": "dev",
      "allowedValues": ["dev", "staging", "prod"]
    }
  },
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2021-04-01",
      "name": "[concat('lakehouse', parameters('environment'))]",
      "location": "[resourceGroup().location]",
      "kind": "StorageV2",
      "sku": {
        "name": "Standard_LRS"
      },
      "properties": {
        "isHnsEnabled": true,
        "supportsHttpsTrafficOnly": true
      }
    }
  ]
}
\`\`\`

# Azure Synapse Analytics Configuration
- Configure dedicated SQL pools for analytical workloads
- Set up Spark pools for data processing
- Enable Data Lake Storage Gen2 for lakehouse storage
- Configure Purview for data governance

# TODO: Add Azure Data Factory pipelines
# TODO: Configure Azure Key Vault for secrets
# TODO: Set up monitoring with Azure Monitor`;

    case 'GCP':
      return `# Google Cloud Deployment Configuration

## Terraform Configuration
\`\`\`hcl
provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_storage_bucket" "lakehouse_bucket" {
  name     = "\${var.project_id}-lakehouse-data"
  location = var.region
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}

resource "google_bigquery_dataset" "lakehouse_dataset" {
  dataset_id = "lakehouse"
  location   = var.region
  
  description = "Lakehouse analytical dataset"
}
\`\`\`

# Cloud Composer (Airflow) DAG
- Set up data ingestion workflows
- Configure BigQuery external tables
- Enable Dataflow for stream processing

# TODO: Configure Cloud SQL for metadata
# TODO: Add Dataproc clusters for Spark processing
# TODO: Set up monitoring with Cloud Monitoring`;

    case 'On-Premise':
      return `# On-Premise Lakehouse Deployment

## Hardware Requirements
- Minimum 3 nodes for high availability
- 32GB RAM per node (recommended: 64GB+)
- SSD storage for metadata (minimum 500GB)
- High-speed network interconnect (10Gbps+)

## Software Stack
\`\`\`yaml
# docker-compose.yml for on-premise deployment
version: '3.8'

services:
  postgres-cluster:
    image: postgres:15
    environment:
      POSTGRES_DB: lakehouse_metadata
      POSTGRES_REPLICATION_MODE: master
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - lakehouse-network
      
  minio-cluster:
    image: minio/minio:latest
    command: server http://minio{1...4}/data{1...2} --console-address ":9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password123
    volumes:
      - minio_data:/data
    networks:
      - lakehouse-network

networks:
  lakehouse-network:
    driver: bridge

volumes:
  postgres_data:
  minio_data:
\`\`\`

# TODO: Configure backup and disaster recovery
# TODO: Set up monitoring and alerting
# TODO: Implement security and access controls`;

    case 'Fly.io':
      return `# Fly.io Deployment Configuration

## fly.toml
\`\`\`toml
app = "lakehouse-app"
primary_region = "ord"

[build]
  image = "your-registry/lakehouse:latest"

[env]
  DATABASE_URL = "postgres://user:pass@lakehouse-db.internal:5432/lakehouse"
  ENVIRONMENT = "production"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
\`\`\`

## Deployment Commands
\`\`\`bash
# Initialize Fly app
fly launch --copy-config --no-deploy

# Create database
fly postgres create --name lakehouse-db

# Attach database
fly postgres attach lakehouse-db

# Deploy application
fly deploy

# Scale application
fly scale count 2
\`\`\`

# TODO: Configure volumes for persistent storage
# TODO: Set up monitoring and logging
# TODO: Add backup strategy for data persistence`;

    default:
      return `# ${targetPlatform} Deployment Configuration

## Platform Overview
This manifest is configured for deployment on ${targetPlatform} with the following technologies:
${keyTechnologies.map(tech => `- ${tech}`).join('\n')}

## Getting Started
1. Review the configuration parameters below
2. Customize the deployment settings for your environment
3. Update resource allocations based on your workload requirements
4. Configure authentication and security settings
5. Test the deployment in a staging environment first

## Configuration Placeholders
- **Storage Configuration**: Configure your data storage backend
- **Compute Resources**: Set appropriate CPU and memory limits
- **Networking**: Configure ingress and service discovery
- **Security**: Set up authentication, authorization, and encryption
- **Monitoring**: Add observability and alerting configuration

## Next Steps
- [ ] Update resource specifications
- [ ] Configure storage backends
- [ ] Set up monitoring and logging
- [ ] Implement backup and disaster recovery
- [ ] Configure CI/CD pipelines
- [ ] Add security and compliance controls

# TODO: Replace this generic template with platform-specific configuration
# TODO: Add detailed deployment instructions
# TODO: Include troubleshooting and maintenance procedures`;
  }
}

export function ManifestForm({ onSubmit, isLoading = false }: ManifestFormProps) {
  const [formData, setFormData] = useState<CreateManifestInput>({
    name: '',
    content: '',
    target_platform: 'AWS',
    key_technologies: [],
    deployment_notes: null,
    region: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update content when platform or technologies change
  useEffect(() => {
    const boilerplate = generateManifestBoilerplate(formData.target_platform, formData.key_technologies);
    setFormData((prev: CreateManifestInput) => ({
      ...prev,
      content: boilerplate
    }));
  }, [formData.target_platform, formData.key_technologies]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (formData.key_technologies.length === 0) {
      newErrors.key_technologies = 'At least one technology must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        name: '',
        content: '',
        target_platform: 'AWS',
        key_technologies: [],
        deployment_notes: null,
        region: null
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleTechnologyToggle = (technology: KeyTechnology, checked: boolean) => {
    setFormData((prev: CreateManifestInput) => ({
      ...prev,
      key_technologies: checked
        ? [...prev.key_technologies, technology]
        : prev.key_technologies.filter((t: KeyTechnology) => t !== technology)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Manifest Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateManifestInput) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Production Analytics Lakehouse"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Manifest Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateManifestInput) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Enter your deployment manifest content here..."
              rows={6}
              className={`resize-none ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            Deployment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_platform">Target Platform *</Label>
              <Select
                value={formData.target_platform}
                onValueChange={(value: TargetPlatform) =>
                  setFormData((prev: CreateManifestInput) => ({ ...prev, target_platform: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_PLATFORMS.map((platform: TargetPlatform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateManifestInput) => ({
                    ...prev,
                    region: e.target.value || null
                  }))
                }
                placeholder="e.g., us-east-1, europe-west1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployment_notes">Deployment Notes</Label>
            <Textarea
              id="deployment_notes"
              value={formData.deployment_notes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateManifestInput) => ({
                  ...prev,
                  deployment_notes: e.target.value || null
                }))
              }
              placeholder="Additional deployment context, requirements, or notes..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Technologies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4" />
            Key Technologies *
          </CardTitle>
          <CardDescription>
            Select the technologies used in this deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {KEY_TECHNOLOGIES.map((technology: KeyTechnology) => (
              <div key={technology} className="flex items-center space-x-2">
                <Checkbox
                  id={technology}
                  checked={formData.key_technologies.includes(technology)}
                  onCheckedChange={(checked: boolean) =>
                    handleTechnologyToggle(technology, checked)
                  }
                />
                <Label
                  htmlFor={technology}
                  className="text-sm font-normal cursor-pointer"
                >
                  {technology}
                </Label>
              </div>
            ))}
          </div>
          {errors.key_technologies && (
            <p className="text-sm text-red-600 mt-2">{errors.key_technologies}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Creating...' : '🚀 Create Manifest'}
        </Button>
      </div>
    </form>
  );
}
