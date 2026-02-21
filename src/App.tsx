import { useEffect, useState, useRef, useCallback } from 'react';

const CONFIG_KEY = '_PA_PROXY_';

interface IConfig {
  host: string;
  port: string;
}

interface Profile {
  id: string;
  name: string;
  host: string;
  port: string;
  httpEnabled: boolean;
  socksEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface HistoryItem {
  id: string;
  profileName: string;
  host: string;
  port: string;
  timestamp: number;
  action: 'enabled' | 'disabled' | 'switched';
}

interface FormItemProps {
  name: string;
  label: string;
  value?: string;
  onChange?: (data: FormItemChangeData) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface FormItemChangeData {
  name: string;
  value: string;
}

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

// 图标组件
const Icons = {
  Host: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  Port: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  PowerOn: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  PowerOff: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Error: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Proxy: ({ status, loading }: { status?: 'on' | 'off'; loading?: boolean }) => {
    const isOn = status === 'on';
    const isLoading = loading;
    return (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        {isLoading && (
          <circle cx="12" cy="12" r="3" className="fill-amber-400 animate-spin" style={{ transformOrigin: '12px 12px' }} />
        )}
        {isOn && !isLoading && (
          <circle cx="12" cy="12" r="3" className="fill-emerald-400 animate-pulse" />
        )}
      </svg>
    );
  },
  Folder: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Scan: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Rules: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Auto: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Launch: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

// Tooltip Component
const Tooltip: React.FC<{
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}> = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className='relative inline-flex'
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <>
          {/* Tooltip with arrow as one unit */}
          <div
            className={`absolute z-50 left-1/2 -translate-x-1/2 flex flex-col items-center ${
              position === 'top' 
                ? 'bottom-full mb-2' 
                : 'top-full mt-2'
            }`}
          >
            {position === 'top' ? (
              // Arrow below tooltip (tooltip above button)
              <>
                <div className="px-2 py-1 text-[10px] font-medium text-white bg-gray-900 border border-gray-700 rounded-lg whitespace-nowrap shadow-lg">
                  {text}
                </div>
                <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
              </>
            ) : (
              // Arrow above tooltip (tooltip below button)
              <>
                <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45 -mb-1" />
                <div className="px-2 py-1 text-[10px] font-medium text-white bg-gray-900 border border-gray-700 rounded-lg whitespace-nowrap shadow-lg">
                  {text}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Button: React.FC<ButtonProps> = props => {
  const { children, onClick, disabled = false, loading = false, variant = 'primary', className = '', fullWidth = false } = props;

  const baseStyles = 'relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 focus:ring-purple-500',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 focus:ring-green-500',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:ring-red-500',
    ghost: 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600 focus:ring-gray-500',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-none' : '';
  const loadingStyles = loading ? 'cursor-wait' : '';
  const fullWidthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type='button'
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${loadingStyles} ${fullWidthStyles} ${className}`}
      onClick={() => !disabled && !loading && onClick && onClick()}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

const FormItem: React.FC<FormItemProps> = props => {
  const { name, label, value, onChange, onSubmit, placeholder, disabled = false } = props;
  const [val, setVal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name: inputName, value: inputValue } = e.target;
    setVal(inputValue);
    onChange && onChange({ name: inputName, value: inputValue });
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit && onSubmit();
  };

  const IconComponent = label === 'Host' ? Icons.Host : Icons.Port;

  return (
    <div className='group'>
      <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
        {label}
      </label>
      <form onSubmit={onFormSubmit} className='relative'>
        <div className={`
          relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
          bg-gray-800/50 border transition-all duration-300
          ${focused
            ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-gray-800'
            : 'border-gray-700/50 hover:border-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <span className={`transition-colors duration-300 ${focused ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
            <IconComponent />
          </span>
          <input
            type='text'
            name={name}
            className='flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-sm font-medium'
            value={val}
            onChange={onInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={disabled}
            autoComplete='off'
          />
        </div>
      </form>
    </div>
  );
};

const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className={`
      flex items-center gap-2 cursor-pointer transition-opacity
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className='relative'>
        <input
          type='checkbox'
          className='sr-only'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`
          w-4 h-4 rounded border-2 transition-all duration-200
          flex items-center justify-center
          ${checked
            ? 'bg-violet-600 border-violet-600'
            : 'bg-gray-800 border-gray-600 hover:border-gray-500'
          }
        `}>
          {checked && (
            <svg className='w-3 h-3 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          )}
        </div>
      </div>
      <span className='text-xs text-gray-300'>{label}</span>
    </label>
  );
};

const Message: React.FC<{ type: 'success' | 'error'; text: string; onClose: () => void }> = ({ type, text, onClose }) => {
  const is_success = type === 'success';

  return (
    <div
      className={`
        fixed top-4 left-1/2 z-50
        -translate-x-1/2
        flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl
        transform transition-all duration-300
        ${is_success
          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
          : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
        }
        message-center
      `}
    >
      <span>
        {is_success ? <Icons.Check /> : <Icons.Error />}
      </span>
      <span className={`flex-1 text-xs font-medium whitespace-nowrap`}>
        {text}
      </span>
      <button
        onClick={onClose}
        className='p-0.5 rounded-lg hover:bg-white/20 transition-colors'
        title="Close"
        aria-label="Close"
      >
        <Icons.Error />
      </button>
    </div>
  );
};

// Profile Selector Component
const ProfileSelector: React.FC<{
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onNewProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profile: Profile) => void;
  onExport: () => void;
  onImport: () => void;
  onDetectSystem: () => void;
  disabled?: boolean;
}> = ({ profiles, activeProfile, onSelectProfile, onNewProfile, onEditProfile, onDeleteProfile, onExport, onImport, onDetectSystem, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
        Profile
      </label>
      <div className='relative'>
        <button
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl
            bg-gray-800/50 border transition-all duration-300
            ${isOpen
              ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-gray-800'
              : 'border-gray-700/50 hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className='flex items-center gap-2.5'>
            <span className={`transition-colors duration-300 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`}>
              <Icons.Folder />
            </span>
            <span className='text-sm font-medium text-gray-100'>
              {activeProfile ? activeProfile.name : 'Select a profile'}
            </span>
          </div>
          <span className={`transition-colors duration-300 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`}>
            <Icons.ChevronDown />
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />
            <div className='absolute z-20 w-full mt-1.5 py-1.5 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto'>
              {profiles.length === 0 ? (
                <div className='px-3 py-2 text-xs text-gray-500 text-center'>
                  No profiles yet
                </div>
              ) : (
                profiles.map(profile => (
                  <div
                    key={profile.id}
                    className='group flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors'
                    onClick={() => {
                      onSelectProfile(profile);
                      setIsOpen(false);
                    }}
                  >
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-gray-200 truncate'>
                          {profile.name}
                        </span>
                        {activeProfile?.id === profile.id && (
                          <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                        )}
                      </div>
                      <span className='text-[10px] text-gray-500'>
                        {profile.host}:{profile.port}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProfile(profile);
                        }}
                        className='p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-violet-400 transition-colors'
                        title='Edit profile'
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProfile(profile);
                        }}
                        className='p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-rose-400 transition-colors'
                        title='Delete profile'
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className='border-t border-gray-700 mt-1 pt-1 space-y-1'>
                <button
                  onClick={() => {
                    onNewProfile();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-violet-400 hover:bg-violet-500/10 transition-colors'
                >
                  <Icons.Plus />
                  New Profile
                </button>
                <button
                  onClick={() => {
                    onDetectSystem();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors'
                >
                  <Icons.Scan />
                  Detect System Proxy
                </button>
                <button
                  onClick={() => {
                    onImport();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors'
                >
                  <Icons.Upload />
                  Import Profiles
                </button>
                <button
                  onClick={() => {
                    onExport();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors'
                >
                  <Icons.Download />
                  Export Profiles
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) => void;
  profile?: Profile | null;
}> = ({ isOpen, onClose, onSave, profile }) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [httpEnabled, setHttpEnabled] = useState(true);
  const [socksEnabled, setSocksEnabled] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setHost(profile.host);
      setPort(profile.port);
      setHttpEnabled(profile.httpEnabled);
      setSocksEnabled(profile.socksEnabled);
    } else {
      setName('');
      setHost('');
      setPort('');
      setHttpEnabled(true);
      setSocksEnabled(true);
    }
  }, [profile, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), host, port, httpEnabled, socksEnabled });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-semibold text-white'>
            {profile ? 'Edit Profile' : 'New Profile'}
          </h3>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <Icons.Close />
          </button>
        </div>

        <div className='space-y-3'>
          <div>
            <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
              Profile Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Home, Work, Public'
              className='w-full px-3.5 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors'
              autoFocus
            />
          </div>

          <FormItem
            name='modal-host'
            label='Host'
            value={host}
            onChange={(data) => setHost(data.value)}
            placeholder='127.0.0.1'
          />

          <FormItem
            name='modal-port'
            label='Port'
            value={port}
            onChange={(data) => setPort(data.value)}
            placeholder='1082'
          />

          <div className='flex gap-4 pt-1'>
            <Checkbox
              label='HTTP/HTTPS'
              checked={httpEnabled}
              onChange={setHttpEnabled}
            />
            <Checkbox
              label='SOCKS'
              checked={socksEnabled}
              onChange={setSocksEnabled}
            />
          </div>
        </div>

        <div className='flex gap-2 mt-5'>
          <Button
            variant='ghost'
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!name.trim() || !host || !port}
            fullWidth
          >
            {profile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
}> = ({ isOpen, onClose, onConfirm, profileName }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center'>
            <Icons.Error />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-white'>Delete Profile</h3>
            <p className='text-xs text-gray-400'>This action cannot be undone</p>
          </div>
        </div>

        <p className='text-xs text-gray-300 mb-5 ml-13'>
          Are you sure you want to delete the profile "<span className='font-medium text-white'>{profileName}</span>"?
        </p>

        <div className='flex gap-2'>
          <Button
            variant='ghost'
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={onConfirm}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// History Panel Component
const HistoryPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClear: () => void;
}> = ({ isOpen, onClose, history, onClear }) => {
  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'enabled': return 'text-emerald-400 bg-emerald-500/10';
      case 'disabled': return 'text-rose-400 bg-rose-500/10';
      case 'switched': return 'text-violet-400 bg-violet-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn max-h-[70vh] overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <span className='text-violet-400'>
              <Icons.History />
            </span>
            <h3 className='text-sm font-semibold text-white'>History</h3>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <Icons.Close />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto space-y-2 min-h-0'>
          {history.length === 0 ? (
            <div className='text-center py-8 text-gray-500 text-xs'>
              No history yet
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className='flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors'
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(item.action)}`}>
                  {item.action === 'enabled' && <Icons.PowerOn />}
                  {item.action === 'disabled' && <Icons.PowerOff />}
                  {item.action === 'switched' && <Icons.Check />}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium text-gray-200 truncate'>
                      {item.profileName}
                    </span>
                    <span className='text-[10px] text-gray-500'>
                      {item.host}:{item.port}
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-500'>
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className='mt-4 pt-4 border-t border-gray-800'>
            <Button variant='ghost' onClick={onClear} fullWidth>
              Clear History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Rule Editor Modal Component
const RuleEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  rules: string[];
  onSave: (rules: string[]) => void;
  proxyHost: string;
  proxyPort: string;
}> = ({ isOpen, onClose, rules, onSave, proxyHost, proxyPort }) => {
  const [ruleText, setRuleText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRuleText(rules.join('\n'));
    }
  }, [isOpen, rules]);

  const handleSave = () => {
    const newRules = ruleText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    onSave(newRules);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn max-h-[80vh] overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <span className='text-violet-400'>
              <Icons.Rules />
            </span>
            <h3 className='text-sm font-semibold text-white'>Rule-Based Mode</h3>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <Icons.Close />
          </button>
        </div>

        <div className='mb-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl'>
          <p className='text-xs text-violet-300'>
            <strong>Rule Format (one per line):</strong>
          </p>
          <ul className='text-[10px] text-violet-400 mt-1 space-y-0.5'>
            <li>• <code className='bg-violet-500/20 px-1 rounded'>*.example.com</code> - Match domain and subdomains</li>
            <li>• <code className='bg-violet-500/20 px-1 rounded'>example.com</code> - Exact domain match</li>
            <li>• <code className='bg-violet-500/20 px-1 rounded'>*://*.example.com/*</code> - Wildcard URL pattern</li>
          </ul>
        </div>

        <div className='flex-1 min-h-0 flex flex-col'>
          <label className='block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider'>
            Proxy Rules
          </label>
          <textarea
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            placeholder='*.google.com&#10;*.facebook.com&#10;*.twitter.com&#10;example.com'
            className='flex-1 w-full min-h-[200px] px-3.5 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-100 text-xs font-mono placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none'
          />
        </div>

        {proxyHost && proxyPort && (
          <div className='mt-3 p-2 bg-gray-800/50 rounded-lg'>
            <p className='text-[10px] text-gray-400'>
              PAC file will use proxy: <span className='text-violet-400 font-mono'>{proxyHost}:{proxyPort}</span>
            </p>
          </div>
        )}

        <div className='flex gap-2 mt-4'>
          <Button variant='ghost' onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave} fullWidth>
            Save Rules
          </Button>
        </div>
      </div>
    </div>
  );
};

// Settings Modal Component
const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  launchAtLogin: boolean;
  onToggleLaunchAtLogin: (enabled: boolean) => void;
  networkMonitoringEnabled: boolean;
  onToggleNetworkMonitoring: (enabled: boolean) => void;
  ruleBasedModeEnabled: boolean;
  onToggleRuleBasedMode: (enabled: boolean) => void;
}> = ({ 
  isOpen, 
  onClose, 
  launchAtLogin, 
  onToggleLaunchAtLogin,
  networkMonitoringEnabled,
  onToggleNetworkMonitoring,
  ruleBasedModeEnabled,
  onToggleRuleBasedMode
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <span className='text-violet-400'>
              <Icons.Settings />
            </span>
            <h3 className='text-sm font-semibold text-white'>Settings</h3>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <Icons.Close />
          </button>
        </div>

        <div className='space-y-3'>
          {/* Launch at Login */}
          <div className='flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50'>
            <div className='flex items-center gap-2'>
              <span className='text-amber-400'>
                <Icons.Launch />
              </span>
              <div>
                <p className='text-xs font-medium text-gray-200'>Launch at Login</p>
                <p className='text-[10px] text-gray-500'>Start automatically on system boot</p>
              </div>
            </div>
            <button
              onClick={() => onToggleLaunchAtLogin(!launchAtLogin)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                launchAtLogin ? 'bg-violet-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  launchAtLogin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Network Change Detection */}
          <div className='flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50'>
            <div className='flex items-center gap-2'>
              <span className='text-emerald-400'>
                <Icons.Auto />
              </span>
              <div>
                <p className='text-xs font-medium text-gray-200'>Network Auto-Switch</p>
                <p className='text-[10px] text-gray-500'>Auto-apply proxy on network change</p>
              </div>
            </div>
            <button
              onClick={() => onToggleNetworkMonitoring(!networkMonitoringEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                networkMonitoringEnabled ? 'bg-violet-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  networkMonitoringEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rule-Based Mode */}
          <div className='flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50'>
            <div className='flex items-center gap-2'>
              <span className='text-blue-400'>
                <Icons.Rules />
              </span>
              <div>
                <p className='text-xs font-medium text-gray-200'>Rule-Based Mode</p>
                <p className='text-[10px] text-gray-500'>Auto-proxy based on domain rules</p>
              </div>
            </div>
            <button
              onClick={() => onToggleRuleBasedMode(!ruleBasedModeEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                ruleBasedModeEnabled ? 'bg-violet-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  ruleBasedModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className='mt-5 p-3 bg-gray-800/30 rounded-xl'>
          <p className='text-[10px] text-gray-500 text-center'>
            Automation features help you manage proxy settings automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [httpEnabled, setHttpEnabled] = useState(true);
  const [socksEnabled, setSocksEnabled] = useState(true);
  const [proxyStatus, setProxyStatus] = useState<'on' | 'off'>('off');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedHost, setSavedHost] = useState('');
  const [savedPort, setSavedPort] = useState('');

  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // History states
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Automation states
  const [showSettings, setShowSettings] = useState(false);
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [networkMonitoringEnabled, setNetworkMonitoringEnabled] = useState(true);
  const [ruleBasedModeEnabled, setRuleBasedModeEnabled] = useState(false);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [rules, setRules] = useState<string[]>([]);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getConfig = (): IConfig | null => {
    const data = localStorage.getItem(CONFIG_KEY);
    if (!data) return null;
    return JSON.parse(data);
  };

  const handleToggleProxy = useCallback(
    async (toggleHost: string, togglePort: string, toggleHttpEnabled: boolean, toggleSocksEnabled: boolean) => {
    if (!toggleHost || !togglePort) {
      showMessage('error', 'Please enter host and port');
      return;
    }

    if (!/^\d+$/.test(togglePort)) {
      showMessage('error', 'Port must be a valid number');
      return;
    }

    if (!toggleHttpEnabled && !toggleSocksEnabled) {
      showMessage('error', 'Please enable at least one proxy type');
      return;
    }

    setLoading(true);
    const result = await window.proxyAPI.toggle(toggleHost, togglePort, proxyStatus, toggleHttpEnabled, toggleSocksEnabled);
    setLoading(false);

    if (result.success) {
      const newStatus = proxyStatus === 'on' ? 'off' : 'on';
      // Add to history
      addToHistory({
        profileName: activeProfile?.name || 'Custom',
        host: toggleHost,
        port: togglePort,
        timestamp: Date.now(),
        action: newStatus === 'on' ? 'enabled' : 'disabled'
      });
      showMessage('success', `Proxy ${newStatus === 'on' ? 'activated' : 'deactivated'}`);
    } else {
      showMessage('error', result.error || 'Failed to toggle proxy');
    }
  }, [proxyStatus, activeProfile]);

  useEffect(() => {
    // Load profiles
    loadProfiles();
    loadHistory();
    loadAutomationSettings();
    loadRules();

    const config = getConfig();
    if (config) {
      setHost(config.host);
      setPort(config.port);
      setSavedHost(config.host);
      setSavedPort(config.port);
    }

    // 获取当前代理状态和配置
    Promise.all([
      window.proxyAPI.getStatus(),
      window.proxyAPI.getConfig()
    ]).then(([status, proxyConfig]) => {
      console.log({ status, proxyConfig });
      setProxyStatus(status as 'on' | 'off');

      // 如果代理已开启，总是使用系统实际配置（覆盖 localStorage）
      if (status === 'on') {
        setHttpEnabled(proxyConfig.httpEnabled);
        setSocksEnabled(proxyConfig.socksEnabled);
        // 如果系统有实际的 host 和 port，显示到界面上
        if (proxyConfig.host && proxyConfig.port) {
          setHost(proxyConfig.host);
          setPort(proxyConfig.port);
          setSavedHost(proxyConfig.host);
          setSavedPort(proxyConfig.port);
        }
      }
    }).finally(() => {
      setInitializing(false);
    });

    window.proxyAPI.onProxyStatusChange(status => {
      setProxyStatus(status as 'on' | 'off');
    });

    // Listen for network changes
    window.automationAPI.onNetworkChange((data) => {
      console.log('Network change detected:', data);
      // Auto-apply the profile on network change
      if (networkMonitoringEnabled && activeProfile?.id === data.profileId) {
        // Apply the profile automatically
        setHost(data.host);
        setPort(data.port);
        setHttpEnabled(data.httpEnabled);
        setSocksEnabled(data.socksEnabled);
        
        // Turn on proxy if it's off
        if (proxyStatus === 'off' && data.host && data.port) {
          handleToggleProxy(data.host, data.port, data.httpEnabled, data.socksEnabled);
          showMessage('success', `Auto-applied ${data.profileName} on network change`);
        }
      }
    });

    return () => {
      window.proxyAPI.removeProxyStatusChangeListener();
      window.automationAPI.removeNetworkChangeListener();
    };
  }, [networkMonitoringEnabled, activeProfile, proxyStatus, handleToggleProxy]);

  const loadProfiles = async () => {
    try {
      const allProfiles = await window.profileAPI.getProfiles();
      setProfiles(allProfiles);

      const active = await window.profileAPI.getActiveProfile();
      if (active) {
        setActiveProfile(active);
        setHost(active.host);
        setPort(active.port);
        setHttpEnabled(active.httpEnabled);
        setSocksEnabled(active.socksEnabled);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const HISTORY_KEY = '_PA_PROXY_HISTORY_';

  const loadHistory = () => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setHistory(parsed.slice(0, 10)); // Keep last 10 items
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const addToHistory = (item: Omit<HistoryItem, 'id'>) => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      const currentHistory = data ? JSON.parse(data) : [];
      const newItem = {
        ...item,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      const updatedHistory = [newItem, ...currentHistory].slice(0, 20); // Keep last 20 items
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory.slice(0, 10));
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
      setShowHistory(false);
      showMessage('success', 'History cleared successfully');
    } catch (error) {
      showMessage('error', 'Failed to clear history');
    }
  };

  // Automation settings functions
  const loadAutomationSettings = async () => {
    try {
      const [launchSettings, lastActiveProfile] = await Promise.all([
        window.automationAPI.getLaunchAtLogin(),
        window.automationAPI.getLastActiveProfile()
      ]);
      setLaunchAtLogin(launchSettings.enabled);
      
      // Store last active profile ID for network change detection
      if (lastActiveProfile.profileId) {
        window.automationAPI.setLastActiveProfile(lastActiveProfile.profileId);
      }
    } catch (error) {
      console.error('Failed to load automation settings:', error);
    }
  };

  const handleToggleLaunchAtLogin = async (enabled: boolean) => {
    try {
      const result = await window.automationAPI.setLaunchAtLogin(enabled);
      if (result.success) {
        setLaunchAtLogin(enabled);
        showMessage('success', enabled ? 'Will launch at login' : 'Launch at login disabled');
      }
    } catch (error) {
      showMessage('error', 'Failed to update launch at login');
    }
  };

  const handleToggleNetworkMonitoring = async (enabled: boolean) => {
    try {
      if (enabled) {
        await window.automationAPI.startNetworkMonitoring();
      } else {
        await window.automationAPI.stopNetworkMonitoring();
      }
      setNetworkMonitoringEnabled(enabled);
      showMessage('success', enabled ? 'Network monitoring enabled' : 'Network monitoring disabled');
    } catch (error) {
      showMessage('error', 'Failed to update network monitoring');
    }
  };

  const loadRules = async () => {
    try {
      const [rules, enabled] = await Promise.all([
        window.rulesAPI.getAll(),
        window.rulesAPI.getEnabled()
      ]);
      setRules(rules);
      setRuleBasedModeEnabled(enabled);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  };

  const handleSaveRules = async (newRules: string[]) => {
    try {
      await window.rulesAPI.save(newRules);
      setRules(newRules);
      
      // Generate PAC file if rule-based mode is enabled
      if (ruleBasedModeEnabled && host && port) {
        const result = await window.rulesAPI.generatePAC(newRules, host, port);
        if (result.success) {
          showMessage('success', 'Rules saved and PAC file generated');
        } else {
          showMessage('error', 'Failed to generate PAC file');
        }
      } else {
        showMessage('success', 'Rules saved');
      }
      setShowRuleEditor(false);
    } catch (error) {
      showMessage('error', 'Failed to save rules');
    }
  };

  const handleToggleRuleBasedMode = async (enabled: boolean) => {
    try {
      await window.rulesAPI.setEnabled(enabled);
      setRuleBasedModeEnabled(enabled);
      
      // Generate PAC file when enabling
      if (enabled && rules.length > 0 && host && port) {
        const result = await window.rulesAPI.generatePAC(rules, host, port);
        if (result.success) {
          showMessage('success', 'Rule-based mode enabled');
        } else {
          showMessage('error', 'Failed to enable rule-based mode');
        }
      } else {
        showMessage('success', enabled ? 'Rule-based mode enabled' : 'Rule-based mode disabled');
      }
    } catch (error) {
      showMessage('error', 'Failed to update rule-based mode');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const onInputChange = (data: FormItemChangeData) => {
    switch (data.name) {
      case 'host':
        setHost(data.value);
        break;
      case 'port':
        setPort(data.value);
        break;
    }
  };

  const onSave = () => {
    const data = { host, port };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
    setSavedHost(host);
    setSavedPort(port);
    showMessage('success', 'Configuration saved successfully');
  };

  const onToggle = async () => {
    await handleToggleProxy(host, port, httpEnabled, socksEnabled);
  };

  // Profile handlers
  const handleSelectProfile = async (profile: Profile) => {
    setActiveProfile(profile);
    setHost(profile.host);
    setPort(profile.port);
    setHttpEnabled(profile.httpEnabled);
    setSocksEnabled(profile.socksEnabled);

    // Update last active profile for network monitoring
    await window.automationAPI.setLastActiveProfile(profile.id);

    // Add to history
    addToHistory({
      profileName: profile.name,
      host: profile.host,
      port: profile.port,
      timestamp: Date.now(),
      action: 'switched'
    });

    try {
      await window.profileAPI.setActiveProfile(profile.id);
      showMessage('success', `Switched to ${profile.name} profile`);
    } catch (error) {
      showMessage('error', 'Failed to switch profile');
    }
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleDeleteProfile = (profile: Profile) => {
    setDeletingProfile(profile);
  };

  const confirmDeleteProfile = async () => {
    if (!deletingProfile) return;

    try {
      await window.profileAPI.deleteProfile(deletingProfile.id);
      setProfiles(profiles.filter(p => p.id !== deletingProfile.id));

      if (activeProfile?.id === deletingProfile.id) {
        setActiveProfile(null);
      }

      showMessage('success', 'Profile deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete profile');
    }

    setDeletingProfile(null);
  };

  const handleSaveProfile = async (data: { name: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) => {
    try {
      let savedProfile: Profile;
      if (editingProfile) {
        savedProfile = await window.profileAPI.updateProfile(editingProfile.id, data);
        setProfiles(profiles.map(p => p.id === editingProfile.id ? savedProfile : p));
        if (activeProfile?.id === editingProfile.id) {
          setActiveProfile(savedProfile);
        }
        showMessage('success', 'Profile updated successfully');
      } else {
        savedProfile = await window.profileAPI.saveProfile(data);
        setProfiles([...profiles, savedProfile]);
        showMessage('success', 'Profile created successfully');
      }
    } catch (error) {
      showMessage('error', editingProfile ? 'Failed to update profile' : 'Failed to create profile');
    }
  };

  // Export/Import and System Proxy Detection handlers
  const handleExport = async () => {
    try {
      await window.profileAPI.exportProfiles();
      showMessage('success', 'Profiles exported successfully');
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'Export cancelled') {
        showMessage('error', 'Failed to export profiles');
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.profiles) {
        showMessage('error', 'Invalid profile file format');
        return;
      }

      const count = await window.profileAPI.importProfiles(data);
      await loadProfiles();
      showMessage('success', `Imported ${count} profile(s)`);
    } catch (error) {
      console.error('Import error:', error);
      showMessage('error', 'Failed to import profiles');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDetectSystem = async () => {
    try {
      const systemProxy = await window.profileAPI.detectSystemProxy();

      if (systemProxy) {
        // Check if a profile with this config already exists
        const existingProfile = profiles.find(
          p => p.host === systemProxy.host && p.port === systemProxy.port
        );

        if (existingProfile) {
          // Select existing profile
          handleSelectProfile(existingProfile);
          showMessage('success', `Found existing profile: ${existingProfile.name}`);
        } else {
          // Create new profile from system proxy
          const newProfile = {
            name: 'System Proxy',
            host: systemProxy.host,
            port: systemProxy.port,
            httpEnabled: systemProxy.httpEnabled,
            socksEnabled: systemProxy.socksEnabled
          };

          const savedProfile = await window.profileAPI.saveProfile(newProfile);
          await loadProfiles();
          handleSelectProfile(savedProfile);
          showMessage('success', 'System proxy detected and saved');
        }
      } else {
        showMessage('error', 'No system proxy detected');
      }
    } catch (error) {
      console.error('Detection error:', error);
      showMessage('error', 'Failed to detect system proxy');
    }
  };

  const hasChanges = host !== savedHost || port !== savedPort;
  const canTurnOn = host && port && /^\d+$/.test(port) && (httpEnabled || socksEnabled);

  return (
    <div className='h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 flex items-center justify-center p-4 overflow-hidden'>
      {/* 背景装饰 */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl' />
      </div>

      {/* Toast 消息 */}
      {message && (
        <Message
          type={message.type}
          text={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProfile}
        onClose={() => setDeletingProfile(null)}
        onConfirm={confirmDeleteProfile}
        profileName={deletingProfile?.name || ''}
      />

      {/* History Panel */}
      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onClear={clearHistory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        launchAtLogin={launchAtLogin}
        onToggleLaunchAtLogin={handleToggleLaunchAtLogin}
        networkMonitoringEnabled={networkMonitoringEnabled}
        onToggleNetworkMonitoring={handleToggleNetworkMonitoring}
        ruleBasedModeEnabled={ruleBasedModeEnabled}
        onToggleRuleBasedMode={handleToggleRuleBasedMode}
      />

      {/* Rule Editor Modal */}
      <RuleEditorModal
        isOpen={showRuleEditor}
        onClose={() => setShowRuleEditor(false)}
        rules={rules}
        onSave={handleSaveRules}
        proxyHost={host}
        proxyPort={port}
      />

      <div className='relative w-full max-w-md'>
        {/* 主卡片 */}
        <div className='relative backdrop-blur-xl bg-gray-900/80 rounded-3xl border border-gray-800/50 shadow-2xl shadow-black/50 overflow-hidden'>
          {/* 顶部渐变条 */}
          <div className='h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500' />

          <div className='p-5 space-y-4'>
            {/* 标题区域 */}
            <div className='flex items-center justify-between'>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border transition-all duration-300 ${initializing ? 'border-amber-500/50 text-amber-400' : proxyStatus === 'on' ? 'border-emerald-500/50 text-emerald-400' : 'border-violet-500/30 text-violet-400'}`}>
                <Icons.Proxy status={proxyStatus} loading={initializing} />
              </div>
              <div className='flex items-center gap-2'>
                <Tooltip text='Rule-Based Mode' position='bottom'>
                  <button
                    onClick={() => setShowRuleEditor(true)}
                    className='p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 text-gray-400 hover:text-blue-400 transition-all'
                  >
                    <Icons.Rules />
                  </button>
                </Tooltip>
                <Tooltip text='Settings' position='bottom'>
                  <button
                    onClick={() => setShowSettings(true)}
                    className='p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 text-gray-400 hover:text-violet-400 transition-all'
                  >
                    <Icons.Settings />
                  </button>
                </Tooltip>
                <Tooltip text='History' position='bottom'>
                  <button
                    onClick={() => setShowHistory(true)}
                    className='p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 text-gray-400 hover:text-violet-400 transition-all'
                  >
                    <Icons.History />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* 表单区域 */}
            <div className='space-y-2.5'>
              <ProfileSelector
                profiles={profiles}
                activeProfile={activeProfile}
                onSelectProfile={handleSelectProfile}
                onNewProfile={handleNewProfile}
                onEditProfile={handleEditProfile}
                onDeleteProfile={handleDeleteProfile}
                onExport={handleExport}
                onImport={handleImport}
                onDetectSystem={handleDetectSystem}
                disabled={loading}
              />

              {/* Hidden file input for import */}
              <input
                ref={fileInputRef}
                type='file'
                accept='.json'
                onChange={handleFileImport}
                className='hidden'
              />

              <FormItem
                name='host'
                label='Host'
                value={host}
                onChange={onInputChange}
                onSubmit={onSave}
                placeholder='127.0.0.1'
                disabled={loading}
              />
              <FormItem
                name='port'
                label='Port'
                value={port}
                onChange={onInputChange}
                onSubmit={onSave}
                placeholder='1082'
                disabled={loading}
              />

              {/* 代理类型选择 */}
              <div className='flex gap-4 pt-1'>
                <Checkbox
                  label='HTTP/HTTPS'
                  checked={httpEnabled}
                  onChange={setHttpEnabled}
                  disabled={loading}
                />
                <Checkbox
                  label='SOCKS'
                  checked={socksEnabled}
                  onChange={setSocksEnabled}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className='space-y-2.5 pt-1'>
              {/* Save 按钮单独一行 */}
              <Button
                onClick={onSave}
                variant='ghost'
                disabled={loading || !hasChanges}
                className={hasChanges ? '' : 'opacity-50'}
                fullWidth
              >
                <Icons.Save />
                Save
              </Button>

              {/* Toggle 按钮 - 大圆形 */}
              <div className='flex justify-center pt-2'>
                <button
                  onClick={onToggle}
                  disabled={loading || (proxyStatus === 'off' && !canTurnOn)}
                  className={`
                    relative w-24 h-24 rounded-full flex items-center justify-center
                    transition-all duration-300 transform active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    ${proxyStatus === 'on' 
                      ? 'bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-rose-500/40 hover:shadow-rose-500/60' 
                      : 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60'
                    }
                  `}
                >
                  {loading ? (
                    <svg className="animate-spin w-10 h-10 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      {proxyStatus === 'on' ? (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </>
                  )}
                </button>
              </div>
              
              {/* 状态文字 */}
              <div className='text-center'>
                <p className={`text-xs font-medium ${proxyStatus === 'on' ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {loading ? 'Switching...' : (proxyStatus === 'on' ? 'Proxy Active' : 'Proxy Inactive')}
                </p>
              </div>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className='px-5 py-2.5 bg-gray-800/30 border-t border-gray-800/50'>
            <div className='flex items-center justify-between text-[10px] text-gray-500'>
              <span>{host || '-'}:{port || '-'}</span>
              <span className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* 卡片阴影装饰 */}
        <div className='absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-emerald-500/20 rounded-3xl blur-xl -z-10 opacity-50' />
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background: linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%);
          background-size: 1000px 100%;
        }

        @keyframes bounce {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
