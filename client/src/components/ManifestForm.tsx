
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
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
