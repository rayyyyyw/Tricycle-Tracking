import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DollarSign,
    TrendingUp,
    Clock,
    Zap,
    Activity,
    AlertCircle,
    Edit,
    Trash2,
    Plus,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface PricingRule {
    id: number;
    name: string;
    ride_type: string;
    base_fare: number;
    per_km_rate: number;
    per_minute_rate: number | null;
    minimum_fare: number;
    surge_multiplier_percent: number;
    peak_hour_start: string | null;
    peak_hour_end: string | null;
    peak_hour_multiplier_percent: number;
    is_active: boolean;
    priority: number;
}

interface DemandStats {
    recent_bookings: number;
    active_drivers: number;
    demand_level: 'low' | 'medium' | 'high' | 'very_high';
}

interface PricingProps {
    pricingRules: PricingRule[];
    demandStats: DemandStats;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pricing Management', href: '/admin/pricing' },
];

export default function Pricing() {
    const { pricingRules, demandStats } = usePage<PricingProps>().props;
    // Kept for future edit functionality
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editingRule, setEditingRule] = useState<number | null>(null);
    const [surgePercent, setSurgePercent] = useState<Record<number, number>>({});

    const getDemandColor = (level: string) => {
        switch (level) {
            case 'very_high': return 'bg-red-100 text-red-700 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-green-100 text-green-700 border-green-300';
        }
    };

    const getDemandText = (level: string) => {
        switch (level) {
            case 'very_high': return 'Very High Demand';
            case 'high': return 'High Demand';
            case 'medium': return 'Medium Demand';
            default: return 'Low Demand';
        }
    };

    const handleToggleSurge = (ruleId: number) => {
        const percent = surgePercent[ruleId] || 0;
        router.post(`/admin/pricing/${ruleId}/surge`, 
            { surge_multiplier_percent: percent },
            {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Surge pricing updated successfully');
                },
            }
        );
    };

    const handleDeleteRule = (ruleId: number) => {
        if (confirm('Are you sure you want to delete this pricing rule?')) {
            router.delete(`/admin/pricing/${ruleId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pricing Management</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Configure fares, surge pricing, and peak hours
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pricing Rule
                    </Button>
                </div>

                {/* Demand Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`border-2 ${getDemandColor(demandStats.demand_level)}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Current Demand
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Badge className={getDemandColor(demandStats.demand_level)}>
                                    {getDemandText(demandStats.demand_level)}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    {demandStats.recent_bookings} bookings in the last hour
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Active Drivers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{demandStats.active_drivers}</p>
                            <p className="text-xs text-muted-foreground mt-1">Drivers currently online</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-600" />
                                Surge Recommendation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {demandStats.demand_level === 'very_high' || demandStats.demand_level === 'high' ? (
                                <div className="space-y-2">
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                        Recommended: {demandStats.demand_level === 'very_high' ? '50-100%' : '25-50%'}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        High demand detected - consider enabling surge pricing
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Badge className="bg-green-100 text-green-700 border-green-300">
                                        No surge needed
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        Supply meets demand
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Pricing Rules */}
                <div className="space-y-4">
                    {pricingRules.map((rule) => (
                        <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {rule.name}
                                            {!rule.is_active && (
                                                <Badge variant="outline" className="text-xs">Inactive</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Ride Type: <span className="font-semibold capitalize">{rule.ride_type}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Base Pricing */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            Base Pricing
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Base Fare:</span>
                                                <span className="font-semibold">₱{rule.base_fare}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Per Kilometer:</span>
                                                <span className="font-semibold">₱{rule.per_km_rate}</span>
                                            </div>
                                            {rule.per_minute_rate && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Per Minute:</span>
                                                    <span className="font-semibold">₱{rule.per_minute_rate}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-muted-foreground">Minimum Fare:</span>
                                                <span className="font-bold text-green-600">₱{rule.minimum_fare}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peak Hours */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            Peak Hours
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            {rule.peak_hour_start && rule.peak_hour_end ? (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Time Range:</span>
                                                        <span className="font-semibold">
                                                            {rule.peak_hour_start.slice(0, 5)} - {rule.peak_hour_end.slice(0, 5)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Multiplier:</span>
                                                        <span className="font-semibold text-blue-600">+{rule.peak_hour_multiplier_percent}%</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-muted-foreground">No peak hours set</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Surge Pricing */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-600" />
                                            Surge Pricing
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="300"
                                                    value={surgePercent[rule.id] ?? rule.surge_multiplier_percent}
                                                    onChange={(e) => setSurgePercent({ ...surgePercent, [rule.id]: parseInt(e.target.value) || 0 })}
                                                    className="w-20 text-sm"
                                                />
                                                <span className="text-sm">%</span>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                className="w-full bg-amber-600 hover:bg-amber-700"
                                                onClick={() => handleToggleSurge(rule.id)}
                                            >
                                                <Zap className="w-4 h-4 mr-2" />
                                                Apply Surge
                                            </Button>
                                            {rule.surge_multiplier_percent > 0 && (
                                                <Badge className="w-full justify-center bg-amber-100 text-amber-700 border-amber-300">
                                                    Current: +{rule.surge_multiplier_percent}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Example Calculation */}
                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Example Calculation (5km, 15min):</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>Base Fare:</span>
                                            <span>₱{rule.base_fare}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Distance (5km × ₱{rule.per_km_rate}):</span>
                                            <span>₱{(5 * rule.per_km_rate).toFixed(2)}</span>
                                        </div>
                                        {rule.per_minute_rate && (
                                            <div className="flex justify-between">
                                                <span>Time (15min × ₱{rule.per_minute_rate}):</span>
                                                <span>₱{(15 * rule.per_minute_rate).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-1 border-t border-border">
                                            <span className="font-semibold">Subtotal:</span>
                                            <span className="font-semibold">
                                                ₱{(rule.base_fare + (5 * rule.per_km_rate) + (rule.per_minute_rate ? 15 * rule.per_minute_rate : 0)).toFixed(2)}
                                            </span>
                                        </div>
                                        {rule.surge_multiplier_percent > 0 && (
                                            <div className="flex justify-between text-amber-600">
                                                <span>Surge (+{rule.surge_multiplier_percent}%):</span>
                                                <span>+₱{((rule.base_fare + (5 * rule.per_km_rate) + (rule.per_minute_rate ? 15 * rule.per_minute_rate : 0)) * (rule.surge_multiplier_percent / 100)).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {rule.peak_hour_multiplier_percent > 0 && (
                                            <div className="flex justify-between text-blue-600">
                                                <span>Peak Hour (+{rule.peak_hour_multiplier_percent}%):</span>
                                                <span>Varies by time</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-1 border-t border-border font-bold text-green-600">
                                            <span>Final Fare:</span>
                                            <span>
                                                ₱{((rule.base_fare + (5 * rule.per_km_rate) + (rule.per_minute_rate ? 15 * rule.per_minute_rate : 0)) * (1 + rule.surge_multiplier_percent / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    About Dynamic Pricing
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    All fare calculations are done server-side for security. Surge pricing helps balance supply and demand during peak times. 
                                    Peak hour pricing automatically activates during configured time ranges. Passengers see the final fare before booking.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
