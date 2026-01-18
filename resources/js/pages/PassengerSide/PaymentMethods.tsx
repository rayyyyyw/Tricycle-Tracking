import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    CreditCard, 
    Wallet, 
    Plus, 
    Trash2,
    CheckCircle,
    AlertCircle,
    History,
    DollarSign
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

export default function PaymentMethods() {
    const { auth } = usePage<SharedData>().props;
    const [loading, setLoading] = useState(false);

    // Mock payment methods - replace with real data from backend
    const paymentMethods = [
        {
            id: 1,
            type: 'cash',
            name: 'Cash',
            isDefault: true,
            description: 'Pay with cash on arrival',
        },
    ];

    const transactions = [
        // Mock transactions - replace with real data
    ];

    const walletBalance = 0; // Replace with real wallet balance

    return (
        <PassengerLayout>
            <Head title="Payment Methods" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your payment options and wallet</p>
                </div>

                {/* Wallet Balance Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-emerald-600" />
                            Wallet Balance
                        </CardTitle>
                        <CardDescription>Your current wallet balance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₱{walletBalance.toFixed(2)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Available for rides
                                </p>
                            </div>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Funds
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Manage how you pay for rides</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Method
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {paymentMethods.length > 0 ? (
                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{method.name}</p>
                                                    {method.isDefault && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {method.isDefault && (
                                                <Badge variant="outline" className="text-xs">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                            {!method.isDefault && (
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No payment methods added</p>
                                <Button className="mt-4" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Payment Method
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Transaction History
                        </CardTitle>
                        <CardDescription>View your payment history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                transaction.type === 'credit' 
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                                                    : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                                {transaction.type === 'credit' ? (
                                                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{transaction.description}</p>
                                                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                                            </div>
                                        </div>
                                        <div className={`font-semibold ${
                                            transaction.type === 'credit' 
                                                ? 'text-emerald-600 dark:text-emerald-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No transactions yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    Payment Information
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Currently, TriGo supports cash payments. Wallet and digital payment methods will be available soon. 
                                    You can add funds to your wallet for faster checkout in the future.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
