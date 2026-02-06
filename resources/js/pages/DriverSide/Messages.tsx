import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    MessageCircle, 
    Search,
    Users,
    AlertCircle
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

export default function Messages() {
    usePage<SharedData>();
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder - no messages yet (chat is in Bookings via BookingChat)
    interface MessagePreview {
        id: number;
        name: string;
        lastMessage: string;
        time: string;
    }
    const messages: MessagePreview[] = [];

    return (
        <DriverLayout>
            <Head title="Messages" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Communicate with passengers and support</p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Messages List */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search messages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <CardTitle className="text-base">Conversations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {messages.length > 0 ? (
                                <div className="space-y-2">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{message.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{message.lastMessage}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{message.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">No messages yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Message View */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Select a conversation</CardTitle>
                            <CardDescription>Choose a conversation from the list to start messaging</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                    Select a conversation from the list to view and send messages. 
                                    You can communicate with passengers about their rides or contact support.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    Messaging Feature Coming Soon
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    The messaging feature is currently under development. Soon you'll be able to communicate 
                                    directly with passengers about their rides, receive updates, and contact support through this interface.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}
