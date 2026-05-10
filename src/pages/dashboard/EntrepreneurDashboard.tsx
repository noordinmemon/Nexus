import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { getMyMeetings } from '../../api/meetings';
import { getUsersByRole } from '../../api/users';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getMyMeetings()
        .then(data => setMeetings(data))
        .catch(err => console.error(err));

      getUsersByRole('investor')
        .then(data => setRecommendedInvestors(data.slice(0, 3)))
        .catch(err => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');
  const upcomingMeetings = meetings.filter(m =>
    m.status === 'accepted' && new Date(m.date) >= new Date()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>
            Find Investors
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Meetings</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900">{acceptedMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{upcomingMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Total Meetings</p>
                <h3 className="text-xl font-semibold text-success-900">{meetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">My Meetings</h2>
              <Badge variant="primary">{pendingMeetings.length} pending</Badge>
            </CardHeader>
            <CardBody>
              {meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map(meeting => (
                    <div key={meeting._id} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            With: {meeting.scheduledBy?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {meeting.date} at {meeting.time}
                          </p>
                          {meeting.message && (
                            <p className="text-sm text-gray-600 mt-2">{meeting.message}</p>
                          )}
                          {meeting.meetingLink && (
                            <p className="mt-2 text-sm text-primary-600">{meeting.meetingLink}</p>
                          )}
                        </div>
                        <Badge
                          variant={
                            meeting.status === 'accepted' ? 'primary' :
                              meeting.status === 'rejected' ? 'gray' :
                                meeting.status === 'cancelled' ? 'gray' : 'secondary'
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No meetings yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When investors schedule meetings, they will appear here
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.length > 0 ? (
                recommendedInvestors.map(investor => (
                  <InvestorCard
                    key={investor._id}
                    investor={investor}
                    showActions={false}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No investors found</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};