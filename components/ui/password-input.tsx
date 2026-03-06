'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input, InputProps } from './input';

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, placeholder, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const disabled = props.value === '' || props.value === undefined || props.disabled;

        return (
            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    className={cn(className, 'pr-10')}
                    ref={ref}
                    placeholder={placeholder}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={disabled}
                >
                    {showPassword && !disabled ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                </Button>
            </div>
        );
    }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
