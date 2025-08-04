
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { ManifestForm } from '@/components/ManifestForm';
import { ManifestEditor } from '@/components/ManifestEditor';
import { Plus, Edit, Trash2, FileText, Calendar, MapPin, AlertCircle, Wifi, WifiOff, Server, PlayCircle } from 'lucide-react';
import type { Manifest, CreateManifestInput, UpdateManifestInput } from '../../server/src/schema';

// Demo data for when server is not available
const DEMO_MANIFESTS: Manifest[] = [
  {
    id: 1,
    name: 'Production Analytics Lakehouse',
    content: `# Production Analytics Lakehouse Deployment

## Overview
This manifest defines the production deployment for our analytics lakehouse infrastructure.

## Components
- Apache Iceberg tables for transactional data
- Trino for query processing
- Apache Airflow for orchestration
- AWS S3 for storage layer

## Configuration
- Multi-AZ deployment for high availability
- Auto-scaling compute resources
- Automated backup and recovery`,
    target_platform: 'AWS',
    key_technologies: ['Apache Iceberg', 'Trino', 'Apache Airflow', 'AWS S3/Minio'],
    deployment_notes: 'Requires VPC setup and IAM roles configuration. Monitor costs during initial deployment phase.',
    region: 'us-east-1',
    created_at: new Date('2024-01-15T10:30:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 2,
    name: 'Development Environment',
    content: `# Development Environment Setup

## Local Development Stack
- DuckDB for fast local analytics
- Docker containers for service isolation
- Local Minio for S3-compatible storage

## Usage
This environment is perfect for:
- Feature development and testing
- Data pipeline prototyping
- Schema evolution experiments`,
    target_platform: 'Local Dev',
    key_technologies: ['DuckDB', 'Docker', 'AWS S3/Minio'],
    deployment_notes: 'Lightweight setup for developers. Uses local resources only.',
    region: null,
    created_at: new Date('2024-01-10T14:20:00Z'),
    updated_at: new Date('2024-01-12T09:15:00Z')
  },
  {
    id: 3,
    name: 'Azure Data Platform',
    content: `# Azure Cloud Data Platform

## Architecture
- Delta Lake on Azure Data Lake Storage
- Apache Spark on Azure Synapse
- dbt for data transformations

## Security
- Azure Active Directory integration
- Private endpoints for secure access
- Data encryption at rest and in transit`,
    target_platform: 'Azure',
    key_technologies: ['Delta Lake', 'Apache Spark', 'dbt', 'Azure Blob Storage'],
    deployment_notes: 'Ensure proper Azure permissions and networking setup before deployment.',
    region: 'eastus2',
    created_at: new Date('2024-01-08T16:45:00Z'),
    updated_at: new Date('2024-01-14T11:30:00Z')
  }
];

function App() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editingManifest, setEditingManifest] = useState<Manifest | null>(null);

  const loadManifests = useCallback(async () => {
    try {
      setConnectionError(null);
      setDemoMode(false);
      const result = await trpc.getManifests.query();
      setManifests(result);
    } catch (error) {
      console.error('Failed to load manifests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to execute \'json\'') || 
          errorMessage.includes('Unexpected end of JSON input') ||
          errorMessage.includes('The string did not match the expected pattern')) {
        setConnectionError('Backend server is returning invalid data. The server handlers may not be fully implemented yet.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setConnectionError('Cannot connect to the backend server. Please check that the server is running and accessible.');
      } else {
        setConnectionError(`Server error: ${errorMessage}`);
      }
      
      // Don't set empty array immediately - let user choose demo mode
      setManifests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManifests();
  }, [loadManifests]);

  const enableDemoMode = () => {
    setDemoMode(true);
    setManifests(DEMO_MANIFESTS);
    setConnectionError(null);
  };

  const handleCreateManifest = async (data: CreateManifestInput) => {
    if (demoMode) {
      // Demo mode: simulate creation locally
      const newManifest: Manifest = {
        id: Math.max(...manifests.map(m => m.id), 0) + 1,
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      setManifests((prev: Manifest[]) => [newManifest, ...prev]);
      setActiveTab('list');
      return;
    }

    setIsLoading(true);
    try {
      setConnectionError(null);
      const response = await trpc.createManifest.mutate(data);
      setManifests((prev: Manifest[]) => [response, ...prev]);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to create manifest:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to create manifest: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateManifest = async (data: UpdateManifestInput) => {
    if (demoMode) {
      // Demo mode: simulate update locally
      setManifests((prev: Manifest[]) => 
        prev.map((m: Manifest) => 
          m.id === data.id 
            ? { ...m, ...data, updated_at: new Date() }
            : m
        )
      );
      setEditingManifest(null);
      setActiveTab('list');
      return;
    }

    setIsLoading(true);
    try {
      setConnectionError(null);
      const response = await trpc.updateManifest.mutate(data);
      if (response) {
        setManifests((prev: Manifest[]) => 
          prev.map((m: Manifest) => m.id === response.id ? response : m)
        );
        setEditingManifest(null);
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Failed to update manifest:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to update manifest: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteManifest = async (id: number) => {
    if (demoMode) {
      // Demo mode: simulate deletion locally
      setManifests((prev: Manifest[]) => prev.filter((m: Manifest) => m.id !== id));
      return;
    }

    setIsLoading(true);
    try {
      setConnectionError(null);
      const response = await trpc.deleteManifest.mutate({ id });
      if (response.success) {
        setManifests((prev: Manifest[]) => prev.filter((m: Manifest) => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete manifest:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Failed to delete manifest: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      setConnectionError(null);
      setDemoMode(false);
      await trpc.healthcheck.query();
      setConnectionError(null);
      await loadManifests();
    } catch (error) {
      console.error('Health check failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(`Connection test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'AWS': 'bg-orange-100 text-orange-800',
      'Azure': 'bg-blue-100 text-blue-800',
      'GCP': 'bg-green-100 text-green-800',
      'On-Premise': 'bg-gray-100 text-gray-800',
      'Kubernetes': 'bg-purple-100 text-purple-800',
      'Fly.io': 'bg-pink-100 text-pink-800',
      'Local Dev': 'bg-yellow-100 text-yellow-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-600" />
            🏗️ Data Lakehouse Manifests
          </h1>
          <p className="text-slate-600 text-lg">
            Manage deployment manifests for your data lakehouse infrastructure
          </p>
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <PlayCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="font-medium mb-1">🎭 Demo Mode Active</div>
              <div className="text-sm">
                You're viewing sample data and can test all features. Changes are stored locally and won't persist after refresh.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Error Alert */}
        {connectionError && !demoMode && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex flex-col gap-3">
              <div className="text-orange-800">
                <div className="font-medium mb-1">🚨 Connection Issue</div>
                <div className="text-sm">{connectionError}</div>
                <div className="text-xs mt-2 opacity-75">
                  💡 This often happens when backend handlers return placeholder data that doesn't match the expected schema.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testConnection}
                  disabled={isLoading}
                  className="border-orange-300 text-orange-800 hover:bg-orange-100"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-800 mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  onClick={enableDemoMode}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Try Demo Mode
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Server Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4" />
            <span className="text-slate-600">Mode:</span>
            {demoMode ? (
              <div className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600 font-medium">Demo Mode</span>
              </div>
            ) : connectionError ? (
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-red-600" />
                <span className="text-red-600 font-medium">Server Issues</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live Server</span>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manifests ({manifests.length})
              {demoMode && <PlayCircle className="h-3 w-3 text-blue-600" />}
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {isLoading && !demoMode && !connectionError ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Loading manifests...
                  </h3>
                  <p className="text-slate-500">
                    Connecting to the server
                  </p>
                </CardContent>
              </Card>
            ) : manifests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    {connectionError ? '⚠️ Unable to load manifests' : '📝 No manifests yet'}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {connectionError 
                      ? 'Server connection issues detected. Try demo mode to explore the interface.'
                      : 'Create your first data lakehouse deployment manifest to get started'
                    }
                  </p>
                  {connectionError ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button onClick={testConnection} disabled={isLoading} variant="outline">
                          <Wifi className="h-4 w-4 mr-2" />
                          Retry Connection
                        </Button>
                        <Button onClick={enableDemoMode} className="bg-blue-600 hover:bg-blue-700">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          🎭 Try Demo Mode
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400">
                        Demo mode lets you explore all features with sample data
                      </p>
                    </div>
                  ) : (
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      🚀 Create First Manifest
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {manifests.map((manifest: Manifest) => (
                  <Card key={manifest.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 text-slate-800">
                            {manifest.name}
                          </CardTitle>
                          <Badge className={`${getPlatformColor(manifest.target_platform)} font-medium`}>
                            {manifest.target_platform}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingManifest(manifest);
                              setActiveTab('create');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Manifest</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{manifest.name}"? 
                                  {demoMode ? ' This action will remove it from the demo session.' : ' This action cannot be undone.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteManifest(manifest.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-slate-600 line-clamp-3">
                        {manifest.content.length > 100 
                          ? `${manifest.content.substring(0, 100)}...`
                          : manifest.content
                        }
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {manifest.key_technologies.slice(0, 3).map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {manifest.key_technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{manifest.key_technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        {manifest.region && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {manifest.region}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(manifest.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingManifest ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingManifest ? 'Edit Manifest' : 'Create New Manifest'}
                  {demoMode && <Badge variant="secondary" className="ml-2">Demo Mode</Badge>}
                </CardTitle>
                <CardDescription>
                  {editingManifest 
                    ? 'Update the deployment manifest details'
                    : 'Define a new deployment manifest for your data lakehouse system'
                  }
                  {demoMode && ' (Changes will be stored locally for this session)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingManifest ? (
                  <ManifestEditor
                    manifest={editingManifest}
                    onSubmit={handleUpdateManifest}
                    onCancel={() => {
                      setEditingManifest(null);
                      setActiveTab('list');
                    }}
                    isLoading={isLoading}
                  />
                ) : (
                  <ManifestForm
                    onSubmit={handleCreateManifest}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
