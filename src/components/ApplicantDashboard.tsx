import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { getApplicationsByUser, createApplication } from '../lib/firebase';
import { User as UserType, Application, ApplicationFormData, PersonalInfo, ProjectDetails } from '../types';
import FileUpload from './FileUpload';

interface ApplicantDashboardProps {
  user: UserType;
  activeView: string;
}

const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ user, activeView }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: user.email,
      phone: '',
      address: '',
      dateOfBirth: ''
    },
    projectDetails: {
      title: '',
      description: '',
      category: '',
      budget: 0,
      timeline: '',
      objectives: []
    },
    files: []
  });
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe = getApplicationsByUser(user.id, (apps) => {
      setApplications(apps as unknown as Application[]);
    });
    return () => unsubscribe();
  }, [user.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-review':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-review':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleProjectDetailsChange = (field: keyof ProjectDetails, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      projectDetails: { ...prev.projectDetails, [field]: value }
    }));
  };

  const handleObjectivesChange = (objectives: string) => {
    const objectiveArray = objectives.split('\n').filter(obj => obj.trim() !== '');
    handleProjectDetailsChange('objectives', objectiveArray);
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    setError('');

    try {
      const applicationData = {
        applicantId: user.id,
        personalInfo: formData.personalInfo,
        projectDetails: formData.projectDetails,
        fileUrls: fileUrls
      };

      await createApplication(applicationData);
      setSuccess('Application submitted successfully!');
      
      // Reset form
      setFormStep(1);
      setFormData({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: user.email,
          phone: '',
          address: '',
          dateOfBirth: ''
        },
        projectDetails: {
          title: '',
          description: '',
          category: '',
          budget: 0,
          timeline: '',
          objectives: []
        },
        files: []
      });
      setFileUrls([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Accepted</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">In Review</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'in-review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest application submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first application.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <h4 className="font-medium">{application.projectDetails.title}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(application.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderApplicationForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">New Application</h2>
        <p className="text-gray-600">Submit a new application for review</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {formStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((formStep / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(formStep / 3) * 100} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {formStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.personalInfo.address}
                onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                placeholder="Enter your full address"
              />
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.personalInfo.dateOfBirth}
                onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Project Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.projectDetails.title}
                onChange={(e) => handleProjectDetailsChange('title', e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.projectDetails.category} 
                onValueChange={(value) => handleProjectDetailsChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.projectDetails.description}
                onChange={(e) => handleProjectDetailsChange('description', e.target.value)}
                placeholder="Describe your project in detail"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.projectDetails.budget}
                  onChange={(e) => handleProjectDetailsChange('budget', parseInt(e.target.value) || 0)}
                  placeholder="Enter budget amount"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={formData.projectDetails.timeline}
                  onChange={(e) => handleProjectDetailsChange('timeline', e.target.value)}
                  placeholder="e.g., 6 months"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="objectives">Project Objectives (one per line)</Label>
              <Textarea
                id="objectives"
                value={formData.projectDetails.objectives.join('\n')}
                onChange={(e) => handleObjectivesChange(e.target.value)}
                placeholder="Enter each objective on a new line"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Upload any supporting files for your application</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFilesUploaded={setFileUrls} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setFormStep(Math.max(1, formStep - 1))}
          disabled={formStep === 1}
        >
          Previous
        </Button>
        
        {formStep < 3 ? (
          <Button onClick={() => setFormStep(formStep + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmitApplication} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );

  const renderApplicationsList = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <p className="text-gray-600">View and manage all your applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-gray-500">You haven't submitted any applications yet.</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.projectDetails.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {application.projectDetails.category} • Submitted {new Date(application.createdAt.seconds * 1000).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{application.projectDetails.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Budget: ${application.projectDetails.budget?.toLocaleString()}</span>
                    <span>Timeline: {application.projectDetails.timeline}</span>
                    <span>Files: {application.fileUrls?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {application.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  switch (activeView) {
    case 'apply':
      return renderApplicationForm();
    case 'applications':
      return renderApplicationsList();
    default:
      return renderDashboard();
  }
};

export default ApplicantDashboard;