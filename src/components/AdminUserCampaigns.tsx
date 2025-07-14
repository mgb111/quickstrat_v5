import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserCampaignInfo {
  id: string;
  email: string;
  plan: string;
  campaign_count: number;
  campaign_count_period: string;
  subscription_expiry: string;
}

const ADMIN_EMAIL = 'manishbhanushali1101@gmail.com';

const AdminUserCampaigns: React.FC = () => {
  const [users, setUsers] = useState<UserCampaignInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated.');
          setLoading(false);
          return;
        }
        setCurrentUserEmail(user.email || '');
        if (user.email !== ADMIN_EMAIL) {
          setError('You are not authorized to view this page.');
          setLoading(false);
          return;
        }
        // Fetch all users
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email, plan, campaign_count, campaign_count_period, subscription_expiry');
        if (fetchError) {
          setError('Failed to fetch users: ' + fetchError.message);
        } else {
          setUsers(data || []);
        }
      } catch (err: any) {
        setError('Error: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">User Campaign Counts (Admin)</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Plan</th>
            <th className="px-4 py-2 text-left">Campaign Count</th>
            <th className="px-4 py-2 text-left">Campaign Count Period</th>
            <th className="px-4 py-2 text-left">Subscription Expiry</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.plan}</td>
              <td className="px-4 py-2">{user.campaign_count}</td>
              <td className="px-4 py-2">{user.campaign_count_period}</td>
              <td className="px-4 py-2">{user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserCampaigns; 