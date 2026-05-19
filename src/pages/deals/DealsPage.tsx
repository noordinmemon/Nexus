import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, ArrowRightCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getTransactions, deposit, withdraw } from '../../api/transactions';
import toast from 'react-hot-toast';

export const DealsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data.transactions);
      setBalance(data.balance);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      if (activeTab === 'deposit') {
        await deposit(Number(amount), description || 'Deposit');
        toast.success('Deposit successful');
      } else {
        await withdraw(Number(amount), description || 'Withdrawal');
        toast.success('Withdrawal successful');
      }
      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle size={18} className="text-green-500" />;
      case 'withdrawal': return <ArrowUpCircle size={18} className="text-red-500" />;
      case 'transfer': return <ArrowRightCircle size={18} className="text-blue-500" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'primary';
      case 'pending': return 'secondary';
      case 'failed': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
        <p className="text-gray-600">Manage your deposits, withdrawals and transfers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-3">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">${balance.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-3">
                <TrendingUp size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-3">
                <ArrowRightCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-xl font-bold text-gray-900">
                  ${transactions
                    .filter(t => t.type === 'deposit' && t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">New Transaction</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'deposit'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'withdraw'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Withdraw
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Balance info */}
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-lg font-semibold text-gray-900">${balance.toLocaleString()}</p>
            </div>

            <Button
              className="w-full"
              onClick={handleTransaction}
              isLoading={processing}
            >
              {activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </Button>
          </CardBody>
        </Card>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Transaction History ({transactions.length})
              </h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <DollarSign size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Make your first deposit to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(transaction => (
                    <div key={transaction._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="mr-3">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {transaction.type}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {transaction.transactionId}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${transaction.type === 'deposit'
                              ? 'text-green-600'
                              : 'text-red-600'
                              }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant={getStatusVariant(transaction.status)} size="sm">
                            {transaction.status}
                          </Badge>
                          {transaction.recipient && (
                            <p className="text-xs text-gray-500">
                              To: {transaction.recipient.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};