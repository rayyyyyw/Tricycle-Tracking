import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DriverLayout from '@/layouts/DriverLayout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';

export default function Messages() {
    usePage<SharedData>();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <DriverLayout>
            <Head title="Messages" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Messages
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Communicate with passengers and support
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Messages List */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search messages..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-base">
                                Conversations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-12 text-center">
                                <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-muted-foreground">
                                    No messages yet
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message View */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Select a conversation</CardTitle>
                            <CardDescription>
                                Choose a conversation from the list to start
                                messaging
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <MessageCircle className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-700" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    No conversation selected
                                </h3>
                                <p className="mb-6 max-w-md text-sm text-muted-foreground">
                                    Select a conversation from the list to view
                                    and send messages. You can communicate with
                                    passengers about their rides or contact
                                    support.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="mb-1 font-medium text-blue-900 dark:text-blue-100">
                                    Need help? Use Support
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    For feedback, complaints, or support
                                    requests, visit the Support page in the
                                    sidebar.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}
