import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../api/users';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEntrepreneur = async () => {
      try {
        const data = await getUserById(id || '');
        if (data.role !== 'entrepreneur') {
          setNotFound(true);
        } else {
          setEntrepreneur(data);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEntrepreneur();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !entrepreneur) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The entrepreneur profile you're looking for doesn't exist.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === entrepreneur._id;
  const isInvestor = currentUser?.role === 'investor';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneur.name)}&background=random`}
              alt={entrepreneur.name}
              size="xl"
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                {entrepreneur.startupName || 'Startup name not set'}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {entrepreneur.startupStage && (
                  <Badge variant="primary">{entrepreneur.startupStage}</Badge>
                )}
                {entrepreneur.fundingNeeded && (
                  <Badge variant="accent">
                    <DollarSign size={14} className="mr-1" />
                    Seeking {entrepreneur.fundingNeeded}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <Link to={`/chat/${entrepreneur._id}`}>
                <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                  Message
                </Button>
              </Link>
            )}
            {isCurrentUser && (
              <Button variant="outline" leftIcon={<UserCircle size={18} />}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">{entrepreneur.bio || 'No bio added yet.'}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Startup Name</h3>
                  <p className="text-gray-700 mt-1">{entrepreneur.startupName || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900">Stage</h3>
                  <p className="text-gray-700 mt-1">{entrepreneur.startupStage || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-900">Funding Needed</h3>
                  <p className="text-gray-700 mt-1">{entrepreneur.fundingNeeded || 'Not specified'}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Contact</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">{entrepreneur.email}</p>
              {!isCurrentUser && isInvestor && (
                <Link to={`/chat/${entrepreneur._id}`} className="mt-4 block">
                  <Button className="w-full" leftIcon={<Send size={16} />}>
                    Send Message
                  </Button>
                </Link>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center p-3 border border-gray-200 rounded-md">
                <FileText size={18} className="text-primary-700 mr-3" />
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};