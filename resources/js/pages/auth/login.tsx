import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = '/auth/facebook';
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors">
            <Head title="Log in - TriGO" />
            
            {/* Left Side - Login Card */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">TriGO</span>
                            <div className="text-xs text-green-400 dark:text-green-300 -mt-1">Tricycle Tracking</div>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-2xl shadow-sm p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Welcome back
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Sign in to your TriGO Account
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            disableWhileProcessing
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                                className="h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 dark:data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-green-600"
                                            />
                                            <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300">
                                                Remember me for 30 days
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-medium bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white border-green-500 dark:border-green-600"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner className="mr-2" />}
                                            Sign in to TriGO
                                        </Button>
                                    </div>

                                    {/* Social Login Section */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Google Button - Original Brand Colors */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGoogleLogin}
                                            className="flex items-center justify-center gap-2 h-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            <span className="font-medium">Google</span>
                                        </Button>
                                        
                                        {/* Facebook Button - Original Brand Colors */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleFacebookLogin}
                                            className="flex items-center justify-center gap-2 h-10 border border-[#1877F2] bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                            <span className="font-medium">Facebook</span>
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                            Don't have an account?{' '}
                                            <TextLink 
                                                href={register()} 
                                                tabIndex={5}
                                                className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                            >
                                                Sign up for TriGO
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>

                        {status && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - TriGO Hero Section */}
            <div className="flex-1 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-emerald-900 hidden lg:flex items-center justify-center p-12 border-l border-green-100 dark:border-gray-700">
                <div className="max-w-lg text-center">
                    {/* Icon/Logo */}
                    <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
                        Track Your{' '}
                        <span className="text-green-600 dark:text-green-400">Fleet</span>
                    </h2>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        Real-time GPS tracking and fleet management for your tricycle business. 
                        Monitor locations, optimize routes, and improve operational efficiency.
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-4 text-left bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-green-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-200 font-medium">Live GPS Tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-200 font-medium">Route Optimization</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700 dark:text-gray-200 font-medium">Smart Alerts & Analytics</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-green-200 dark:border-gray-600">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">24/7</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Monitoring</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">99%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">50+</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Tricycles</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}