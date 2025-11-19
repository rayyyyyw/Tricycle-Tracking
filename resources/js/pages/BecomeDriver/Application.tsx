// resources/js/Pages/BecomeDriver/Application.tsx
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Car, FileText, User, Shield, BadgeCheck } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function BecomeDriver() {
    const { data, setData, post, processing, errors } = useForm({
        license_number: '',
        license_expiry: '',
        vehicle_type: 'tricycle',
        vehicle_plate_number: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_color: '',
        vehicle_model: '',
        license_front: null as File | null,
        license_back: null as File | null,
        vehicle_registration: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/become-driver');
    };

    const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData(field as any, file);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <Head title="Become a Driver" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Button variant="ghost" asChild className="mb-6">
                        <Link href="/passenger/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Car className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Become a TriGo Driver
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Complete your application to join our network of trusted tricycle drivers.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Requirements Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="flex items-start gap-3">
                                    <BadgeCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Valid Driver's License</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Front and back photos</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <BadgeCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Tricycle Registration</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Current registration papers</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <BadgeCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Vehicle Details</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Complete vehicle information</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="border-slate-200 dark:border-slate-700 mt-6">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Application Review</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                            We'll review your application within 24-48 hours. Ensure all documents are clear and readable.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Form */}
                    <div className="lg:col-span-3">
                        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Driver Application
                                </CardTitle>
                                <CardDescription>
                                    Please provide accurate information for your driver application
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                                    {/* Driver's License Section */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                                Driver's License Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="license_number">License Number *</Label>
                                                    <Input
                                                        id="license_number"
                                                        value={data.license_number}
                                                        onChange={(e) => setData('license_number', e.target.value)}
                                                        placeholder="Enter license number"
                                                        className="dark:bg-slate-800"
                                                    />
                                                    {errors.license_number && (
                                                        <p className="text-sm text-red-600">{errors.license_number}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="license_expiry">License Expiry Date *</Label>
                                                    <Input
                                                        id="license_expiry"
                                                        type="date"
                                                        value={data.license_expiry}
                                                        onChange={(e) => setData('license_expiry', e.target.value)}
                                                        className="dark:bg-slate-800"
                                                    />
                                                    {errors.license_expiry && (
                                                        <p className="text-sm text-red-600">{errors.license_expiry}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Files */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="license_front">License Front Photo *</Label>
                                                <Input
                                                    id="license_front"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={handleFileChange('license_front')}
                                                    className="dark:bg-slate-800"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Clear photo of license front
                                                </p>
                                                {errors.license_front && (
                                                    <p className="text-sm text-red-600">{errors.license_front}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="license_back">License Back Photo *</Label>
                                                <Input
                                                    id="license_back"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={handleFileChange('license_back')}
                                                    className="dark:bg-slate-800"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Clear photo of license back
                                                </p>
                                                {errors.license_back && (
                                                    <p className="text-sm text-red-600">{errors.license_back}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Information Section */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                                Tricycle Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                                                    <Select value={data.vehicle_type} onValueChange={(value) => setData('vehicle_type', value)}>
                                                        <SelectTrigger className="dark:bg-slate-800">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tricycle">Tricycle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.vehicle_type && (
                                                        <p className="text-sm text-red-600">{errors.vehicle_type}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicle_plate_number">Plate Number *</Label>
                                                    <Input
                                                        id="vehicle_plate_number"
                                                        value={data.vehicle_plate_number}
                                                        onChange={(e) => setData('vehicle_plate_number', e.target.value)}
                                                        placeholder="e.g., ABC 123"
                                                        className="dark:bg-slate-800"
                                                    />
                                                    {errors.vehicle_plate_number && (
                                                        <p className="text-sm text-red-600">{errors.vehicle_plate_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="vehicle_year">Vehicle Year *</Label>
                                                <Select value={data.vehicle_year.toString()} onValueChange={(value) => setData('vehicle_year', parseInt(value))}>
                                                    <SelectTrigger className="dark:bg-slate-800">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((year) => (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.vehicle_year && (
                                                    <p className="text-sm text-red-600">{errors.vehicle_year}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="vehicle_color">Vehicle Color *</Label>
                                                <Input
                                                    id="vehicle_color"
                                                    value={data.vehicle_color}
                                                    onChange={(e) => setData('vehicle_color', e.target.value)}
                                                    placeholder="e.g., Red, Blue"
                                                    className="dark:bg-slate-800"
                                                />
                                                {errors.vehicle_color && (
                                                    <p className="text-sm text-red-600">{errors.vehicle_color}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="vehicle_model">Vehicle Model *</Label>
                                                <Input
                                                    id="vehicle_model"
                                                    value={data.vehicle_model}
                                                    onChange={(e) => setData('vehicle_model', e.target.value)}
                                                    placeholder="e.g., Honda TMX"
                                                    className="dark:bg-slate-800"
                                                />
                                                {errors.vehicle_model && (
                                                    <p className="text-sm text-red-600">{errors.vehicle_model}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Registration */}
                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_registration">Vehicle Registration Certificate *</Label>
                                            <Input
                                                id="vehicle_registration"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleFileChange('vehicle_registration')}
                                                className="dark:bg-slate-800"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Clear photo of registration certificate
                                            </p>
                                            {errors.vehicle_registration && (
                                                <p className="text-sm text-red-600">{errors.vehicle_registration}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Submitting...
                                                </div>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            asChild 
                                            className="py-2.5"
                                        >
                                            <Link href="/passenger/dashboard">
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}