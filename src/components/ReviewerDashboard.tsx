import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Star, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { getAllApplications, createReview, getReviewsByApplication, updateApplication } from '../lib/firebase';
import { User as UserType, Application, Review } from '../types';

interface ReviewerDashboardProps {
  user: UserType;
  activeView: string;
}

const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ user, activeView }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({
    score: 5,
    comments: '',
    privateNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsubscribe = getAllApplications((apps) => {
      const typedApps = apps as Application[];
      const reviewableApps = typedApps.filter(app => 
        app.status === 'pending' || app.status === 'in-review'
      );
      setApplications(reviewableApps);
    });
    return () => unsubscribe();
  }, []);

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

  const handleApplicationSelect = async (application: Application) => {
    setSelectedApplication(application);
    try {
      const appReviews = await getReviewsByApplication(application.id);
      setReviews(appReviews as Review[]);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    setLoading(true);
    setError('');

    try {
      await createReview({
        applicationId: selectedApplication.id,
        reviewerId: user.id,
        reviewerName: user.name,
        score: reviewForm.score,
        comments: reviewForm.comments,
        privateNotes: reviewForm.privateNotes
      });

      if (selectedApplication.status === 'pending') {
        await updateApplication(selectedApplication.id, { status: 'in-review' });
      }

      setSuccess('Review submitted successfully!');
      setReviewForm({ score: 5, comments: '', privateNotes: '' });
      
      const updatedReviews = await getReviewsByApplication(selectedApplication.id);
      setReviews(updatedReviews as Review[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setLoading(true);
    try {
      await updateApplication(applicationId, { status: newStatus });
      setSuccess(`Application status updated to ${newStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h2>
        <p className="text-gray-600">Review and evaluate applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Available to Review</p>
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
                <p className="text-sm font-medium">Pending Review</p>
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
          <CardTitle>Applications for Review</CardTitle>
          <CardDescription>Select an application to review</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications to review</h3>
              <p className="mt-1 text-sm text-gray-500">All applications have been reviewed or assigned to other reviewers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <h4 className="font-medium">{application.projectDetails.title}</h4>
                      <p className="text-sm text-gray-500">
                        {application.projectDetails.category} • Submitted {new Date(application.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApplicationSelect(application)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderApplicationDetail = () => {
    if (!selectedApplication) return renderDashboard();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
            <p className="text-gray-600">{selectedApplication.projectDetails.title}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedApplication(null)}>
            Back to List
          </Button>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.personalInfo.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.personalInfo.phone}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Category:</span> {selectedApplication.projectDetails.category}</p>
                    <p><span className="font-medium">Budget:</span> ${selectedApplication.projectDetails.budget?.toLocaleString()}</p>
                    <p><span className="font-medium">Timeline:</span> {selectedApplication.projectDetails.timeline}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedApplication.projectDetails.description}</p>
                </div>

                {selectedApplication.projectDetails.objectives && selectedApplication.projectDetails.objectives.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Objectives</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedApplication.projectDetails.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {selectedApplication.fileUrls && selectedApplication.fileUrls.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Supporting Files</h4>
                      <div className="space-y-2">
                        {selectedApplication.fileUrls.map((url, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              File {index + 1}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.reviewerName}</span>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{review.score}/10</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comments}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="score">Score (1-10)</Label>
                  <Select 
                    value={reviewForm.score.toString()} 
                    onValueChange={(value) => setReviewForm(prev => ({ ...prev, score: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comments">Public Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Enter your review comments (visible to applicant)"
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="privateNotes">Private Notes</Label>
                  <Textarea
                    id="privateNotes"
                    placeholder="Enter private notes (only visible to reviewers and admins)"
                    value={reviewForm.privateNotes}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, privateNotes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitReview} disabled={loading} className="w-full">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                    disabled={loading}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  switch (activeView) {
    case 'review':
      return selectedApplication ? renderApplicationDetail() : renderDashboard();
    case 'my-reviews':
      return renderDashboard();
    default:
      return renderDashboard();
  }
};

export default ReviewerDashboard;